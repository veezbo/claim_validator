from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from modal import App, web_endpoint, Secret, Image
from json import JSONDecodeError
import os

from openai import OpenAI

from prompt import claim_extraction_prompt, claim_validation_prompt

image = Image.debian_slim().pip_install_from_requirements("requirements.txt")

# Modal App
app = App(
    name="claim-validator",
    image=image,
)


# Route to handle requests from the browser extension
@app.function(secrets=[Secret.from_name("claim-validator-secrets")])
@web_endpoint(method="POST")
async def claim_validation(request: Request) -> JSONResponse:
    from openai import OpenAI

    # Define allowed origins
    allowed_origins = [
        f"chrome-extension://{os.environ['CHROME_DEV_EXTENSION_ID']}",
        f"chrome-extension://{os.environ['CHROME_PROD_EXTENSION_ID']}",
    ]

    # Check origin
    origin = request.headers.get('origin')
    print("ORIGIN:", origin)
    if origin not in allowed_origins:
        raise HTTPException(status_code=403, detail="Access forbidden")

    # Set up with provider URL and API key. These can be swapped as needed.
    # NOTE: We are just using the openai library, but you can use any provider's models and/or API that supports this
    openai = OpenAI(
        base_url="https://api.groq.com/openai/v1",  # If you have beta access to Groq, it's highly recommended!
        # base_url="https://openrouter.ai/api/v1",  # Otherwise, you can use OpenRouter
        api_key=os.environ["LLM_API_KEY"],
    )

    # Convert text to claim extraction prompt
    try:
        body = await request.json()
    except JSONDecodeError as e:
        print("JSONDecodeError on this request body: ", e.doc)
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    if "text" not in body:
        raise HTTPException(status_code=400, detail="Missing text parameter")
    if "source" not in body:
        raise HTTPException(status_code=400, detail="Missing source parameter")

    text = body['text']
    print("Text: ", text)
    claims = await extract_claims(openai, text)
    print("Extracted claims text:\n", claims)

    filtered_claims = filter_claims(claims)
    print("Filtered claims:\n", filtered_claims)

    source = body['source']
    validation = await validate_claims(openai, filtered_claims, source)
    print("Validation Report:\n", validation)

    return JSONResponse(
        content={"report": validation},
        headers={
            "Access-Control-Allow-Origin": origin,
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    )


def filter_claims(claims_str: str) -> list[str]:
    # Keep only lines in claims starting with "Claim"
    return [line.strip() for line in claims_str.split("\n") if line.strip().startswith("Claim")]


async def extract_claims(openai: OpenAI, text: str) -> str:
    prompt = claim_extraction_prompt(text)

    # May need to make this async
    response = openai.chat.completions.create(
        messages=[{"role": "system", "content": prompt}],
        model="llama3-8b-8192",
    )

    return response.choices[0].message.content


async def validate_claims(openai: OpenAI, claims: list[str], source: str) -> str:
    prompt = claim_validation_prompt(claims, source)

    # May need to make this async
    response = openai.chat.completions.create(
        messages=[{"role": "system", "content": prompt}],
        model="mixtral-8x7b-32768",
    )

    return response.choices[0].message.content
