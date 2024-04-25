def claim_extraction_prompt(text: str) -> str:
    return f"""You are a claim extractor. You will receive a comment written on the internet containing potentially false statements and atleast one link (citation). Your job is to extract the claim or set of claims that the comment intended to support with the included citation. Ensure that you provide the claims written as factually as possible without making any reference to the writer, being as concise as possible. Output exactly 1, 2, or 3 claims, prioritizing the most important claims if there are more.

## Written Comment
{text}

## Output Instruction
Now, please provide the list of one or more claims in the comment, ensuring that the claims are written without referring to yourself or the commentator. Do NOT refer to the commentator in the third person. Do NOT use the phrases "the writer," "the author," "the commentator," "I think," or "I am a commentator," or any similar phrases or you will be severely penalized. Be concise. Output exactly 1, 2, or 3 claims. The following output format is expected:

Claim <1>: <Claim 1 Text>
...
Claim <N>: <Claim N Text>
"""


def claim_validation_prompt(claims: list[str], source: str) -> str:
    claims_str = '\n'.join(claims)
    return f"""You are a claim verifier. A user on the internet has made one or more claims in their comment and wants to support them with citations. You will receive this set of claims, which are potentially false, along with the content of the citations. For each claim, remove any reference to the first or third person and consider only the factual content, and then determine whether the claim is supported exclusively by the content in the citation, providing some reasoning why or why not.

## Claims
${claims_str}

## Citation Content
${source}

## Output Instruction
Now, please provide the list of claims and just their factual content with references to the first or third person removed. Alongside each claim, include whether the content in the citation supports that claim along with an explanation of why or why not. Provide direct quotes for your explanation whenever possible. The following output format is expected:

Claim <1>: <The first claim's text>
Verification: <Whether the claim is supported and explanation of why or why not>
...
Claim <N>: <The Nth claim's text>
Verification: <Whether the claim is supported and explanation of why or why not>
"""
