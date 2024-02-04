
export function getClaimExtractionPrompt(comment) {
    return `You are a claim extractor. You will receive a comment written on the internet containing potentially false statements. Your job is to extract the claim or set of claims that the comment intended to support with the included citation. Ensure that you provide the claims written as factually as possible without making any reference to the writer, being as concise as possible.

## Written Comment
${comment}

## Output Instruction
Now, please provide the list of one or more claims in the comment, ensuring that the claims are written without referring to yourself or the commentator. Do NOT refer to the commentator in the third person. Do NOT use the phrases "the writer," "the author," "the commentator," "I think," or "I am a commentator," or any similar phrases or you will be severely penalized. Be concise. The following output format is expected:

Claim <1>: <Claim 1 Text>
...
Claim <N>: <Claim N Text>`
}

export function getClaimVerificationPrompt(claims, source) {
  return `You are a claim verifier. A user on the internet has made one or more claims in their comment and wants to support them with citations. You will receive this set of claims, which are potentially false, along with the content of the citations. For each claim, remove any reference to the first or third person and consider only the factual content, and then determine whether the claim is supported exclusively by the content in the citation. You must provide a justification why or why not.

## Claims
${claims}

## Citation Content
${source}

## Output Instruction
Now, please provide the list of claims and just their factual content with references to the first or third person removed. Alongside each claim, include whether the content in the citation supports that claim along with justification. Provide direct quotes for justification whenever possible. The following output format is expected:

Claim <N>: <The Nth CLAIM'S TEXT>
Verification: <VERIFICATION TEXT WITH EXPLANATION>`

}

export function getCompleteClaimVerificationPrompt(comment, source) {
  return `You are a claim verifier. You will receive a comment written on the internet containing claims, which are potentially false, along with the content of the citations that comment includes to support their claims. Your job is to extract the claim or set of claims in the written comment. Then, for each claim, you must determine whether the claim is supported exclusively by the content in the citation and provide a justification why or why not.

## Written Comment
${comment}

## Citation Content
${source}

## Output Instruction
Now, please provide the list of claims in the written text, and whether the content in the citation supports that claim along with justification. Provide direct quotes for justification whenever possible. The following output format is expected:

Claim <N>: <The Nth CLAIM'S TEXT>
Verification: <VERIFICATION TEXT WITH EXPLANATION>`

}

import OpenAI from "openai";

const OPEN_ROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPEN_ROUTER_API_KEY,  // OpenRouter API key
      // defaultHeaders: {
      //   "HTTP-Referer": $YOUR_SITE_URL, // Optional, for including your app on openrouter.ai rankings.
      //   "X-Title": $YOUR_SITE_NAME, // Optional. Shows in rankings on openrouter.ai.
      // },
    // apiKey: OPENAI_API_KEY,  // OpenAI API Key
    dangerouslyAllowBrowser: true,
});

export async function getExtractedClaims(prompt) {
    return new Promise((resolve, reject) => {
        openai.chat.completions.create({
            messages: [{ role: "system", content: prompt}],
            // model: "mistralai/mistral-7b-instruct",
            // model: "huggingfaceh4/zephyr-7b-beta",
            model: "nousresearch/nous-capybara-7b:free",
        }).then((response) => {
            console.log(response.choices[0]);
            resolve(response.choices[0].message.content);
        }).catch((error) => {
            console.error("Error when querying LLM API: ", error);
            reject(error);
        });
    });
}

export async function getClaimVerificationReport(prompt) {
    return new Promise((resolve, reject) => {
        openai.chat.completions.create({
            messages: [{ role: "system", content: prompt}],
            // model: "gpt-3.5-turbo-1106",
            // model: "anthropic/claude-instant-v1-100k",
            model: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
        }).then((response) => {
            console.log(response.choices[0]);
            resolve(response.choices[0].message.content);
        }).catch((error) => {
            console.error("Error when querying LLM API: ", error);
            reject(error);
        });
    });
}

