from typing import Literal

from pydantic import BaseModel


ResourceCategory = Literal[
    "anxiety",
    "focus",
    "sleep",
    "stress",
    "low-mood",
    "sensory",
    "crisis",
]


class SupportResource(BaseModel):
    id: str
    title: str
    category: ResourceCategory
    summary: str
    content: list[str]
    professional_support_recommended: bool = False


class ExpertSupportEntry(BaseModel):
    id: str
    title: str
    profession: str
    description: str
    suitable_for: list[str]
    route: str
    urgent: bool = False


class SafeguardingGuide(BaseModel):
    title: str
    principles: list[str]
    urgent_message: str
