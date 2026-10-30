"""
AI Overlap Engine for AICTE Grievance Bureaus (RB, PGRC, AB, Legal).
Utilizes the OpenAI Python SDK configured for a custom `gpt-oss-120b` endpoint.

This engine analyzes cross-bureau complaints lodged against the same technical institute
to detect overlapping allegations, repeated grievances, or conflicting bureau actions.
"""

import os
import json
import re
import logging
from typing import Dict, Any, Optional
from openai import OpenAI

logger = logging.getLogger("aicte_ai_service")
logging.basicConfig(level=logging.INFO)

# Configuration for custom open-source inference endpoint (gpt-oss-120b)
CUSTOM_AI_API_KEY = os.getenv("OPENAI_API_KEY", "placeholder_api_key_aicte_oss_120b")
CUSTOM_AI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.custom-ai-gateway.aicte.gov.in/v1")
MODEL_NAME = os.getenv("AI_MODEL_NAME", "gpt-oss-120b")

# Initialize OpenAI Client pointing to the enterprise custom gateway
client = OpenAI(
    api_key=CUSTOM_AI_API_KEY,
    base_url=CUSTOM_AI_BASE_URL,
    timeout=20.0
)


def _heuristic_overlap_fallback(desc1: str, desc2: str) -> Dict[str, Any]:
    """
    Fallback deterministic NLP analyzer if the remote AI cluster is unreachable.
    Evaluates token intersections across statutory AICTE grievance terms.
    """
    keywords = [
        "salary", "faculty", "refund", "capitation", "infrastructure", "library",
        "harassment", "ragging", "affiliation", "approval", "land", "funds",
        "deficiency", "hostel", "principal", "degree", "marksheet", "admissions"
    ]
    t1 = set(desc1.lower().split())
    t2 = set(desc2.lower().split())
    common = t1.intersection(t2)
    matched_keywords = [k for k in keywords if k in t1 and k in t2]

    # Calculate token overlap ratio
    union_len = max(len(t1.union(t2)), 1)
    base_sim = (len(common) / union_len) * 100

    # Boost score if specific statutory terms overlap
    sim_percent = min(round(base_sim * 2.5 + (len(matched_keywords) * 15), 1), 96.0)
    coordination_required = "YES" if (sim_percent >= 55.0 or len(matched_keywords) >= 2) else "NO"

    return {
        "similarity_percentage": sim_percent,
        "coordination_required": coordination_required,
        "key_overlap_points": matched_keywords if matched_keywords else ["General administrative inquiry"],
        "reasoning": f"Local fallback analysis detected {len(matched_keywords)} core domain keyword overlap(s): {', '.join(matched_keywords) or 'None'}.",
        "model_used": "heuristic-fallback"
    }


def detect_overlap(new_complaint_desc: str, existing_complaint_desc: str) -> Dict[str, Any]:
    """
    Analyzes two complaint descriptions from different or same bureaus using gpt-oss-120b.

    Parameters:
        new_complaint_desc (str): Narrative of the newly lodged grievance.
        existing_complaint_desc (str): Narrative of an ongoing or active case for the same institute.

    Returns:
        Dict with keys:
            - similarity_percentage (float): Estimated semantic overlap (0.0 to 100.0)
            - coordination_required (str): "YES" or "NO"
            - key_overlap_points (list[str]): Bullet points of identical allegations
            - reasoning (str): Executive explanation for AICTE Bureau Heads
            - model_used (str): Name of model that produced the inference
    """
    system_prompt = (
        "You are an expert AI Legal & Bureau Coordination Analyst for the All India Council for Technical Education (AICTE).\n"
        "Your objective is to compare two institutional grievance descriptions regarding the same technical institute.\n"
        "Institutions often receive simultaneous complaints lodged with different bureaus:\n"
        "- Regulation Bureau (RB): Structural, land, approval, or affiliation compliance\n"
        "- Public & Grievance Redressal Cell (PGRC): Faculty salary, student refund, harassment, exam malpractice\n"
        "- Approval Bureau (AB): Extension of Approval (EoA) deficiencies\n"
        "- Legal Cell: High Court writs, show-cause appeals\n\n"
        "You must analyze whether the new complaint substantially overlaps in allegations, evidence, or affected parties "
        "with the existing active case, and determine if multi-bureau joint coordination or consolidation is required.\n\n"
        "Respond STRICTLY in valid JSON format with the following keys:\n"
        "{\n"
        '  "similarity_percentage": <number between 0.0 and 100.0>,\n'
        '  "coordination_required": <"YES" or "NO">,\n'
        '  "key_overlap_points": [<short string>, ...],\n'
        '  "reasoning": <concise 2-sentence rationale for bureau directors>\n'
        "}"
    )

    user_prompt = (
        f"--- NEW COMPLAINT DESCRIPTION ---\n{new_complaint_desc.strip()}\n\n"
        f"--- EXISTING ACTIVE COMPLAINT DESCRIPTION ---\n{existing_complaint_desc.strip()}\n\n"
        "Analyze both descriptions for factual, stakeholder, and procedural overlaps. Produce the JSON output."
    )

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
            max_tokens=600,
            response_format={"type": "json_object"} if hasattr(client, "chat") else None
        )

        content = response.choices[0].message.content or "{}"
        
        # Extract JSON from potential code fences
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
        else:
            data = json.loads(content)

        # Normalize and validate outputs
        similarity = float(data.get("similarity_percentage", 0.0))
        similarity = max(0.0, min(100.0, similarity))

        coordination = str(data.get("coordination_required", "NO")).strip().upper()
        if coordination not in ["YES", "NO"]:
            coordination = "YES" if similarity >= 60.0 else "NO"

        overlap_points = data.get("key_overlap_points", [])
        if not isinstance(overlap_points, list):
            overlap_points = [str(overlap_points)]

        return {
            "similarity_percentage": similarity,
            "coordination_required": coordination,
            "key_overlap_points": overlap_points,
            "reasoning": data.get("reasoning", "Semantic overlap identified across allegations."),
            "model_used": MODEL_NAME
        }

    except Exception as exc:
        logger.warning(
            "Could not connect to custom gpt-oss-120b gateway (%s). Utilizing domain heuristic engine. Error: %s",
            CUSTOM_AI_BASE_URL,
            str(exc)
        )
        return _heuristic_overlap_fallback(new_complaint_desc, existing_complaint_desc)
