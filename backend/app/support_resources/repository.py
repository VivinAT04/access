from app.support_resources.schemas import (
    ExpertSupportEntry,
    SafeguardingGuide,
    SupportResource,
)


RESOURCES: list[SupportResource] = [
    SupportResource(
        id="grounding-basics",
        title="Grounding during overwhelming moments",
        category="anxiety",
        summary=(
            "Simple ways to reconnect with your "
            "surroundings when thoughts or sensations "
            "feel overwhelming."
        ),
        content=[
            (
                "Notice five things you can see, four "
                "things you can feel, three things you "
                "can hear, two things you can smell and "
                "one thing you can taste."
            ),
            (
                "Keep your breathing comfortable rather "
                "than forcing a particular rhythm."
            ),
            (
                "Choose one small physical anchor, such "
                "as feeling your feet on the floor."
            ),
        ],
    ),
    SupportResource(
        id="gentle-focus",
        title="Starting when concentration feels difficult",
        category="focus",
        summary=(
            "Reduce the size of the starting step rather "
            "than expecting immediate sustained focus."
        ),
        content=[
            (
                "Choose one task outcome rather than the "
                "whole project."
            ),
            (
                "Start with a short timer and increase it "
                "only if that feels useful."
            ),
            (
                "Remove one distraction instead of trying "
                "to create a perfect environment."
            ),
        ],
    ),
    SupportResource(
        id="stress-recovery",
        title="Recovering after a stressful period",
        category="stress",
        summary=(
            "Ideas for reducing demands after periods of "
            "high cognitive or emotional load."
        ),
        content=[
            (
                "Prioritise essential tasks and postpone "
                "non-urgent demands where possible."
            ),
            (
                "Use shorter work blocks with deliberate "
                "breaks."
            ),
            (
                "Notice whether noise, lighting or social "
                "demands are increasing overload."
            ),
        ],
    ),
    SupportResource(
        id="sensory-overload",
        title="Responding to sensory overload",
        category="sensory",
        summary=(
            "Practical adjustments when sensory input "
            "starts becoming difficult to manage."
        ),
        content=[
            (
                "Reduce unnecessary visual and auditory "
                "input when possible."
            ),
            (
                "Move to a quieter or lower-stimulation "
                "space if one is available."
            ),
            (
                "Use your Aksess sensory settings to "
                "reduce brightness, motion and interface "
                "density."
            ),
        ],
    ),
    SupportResource(
        id="low-mood-small-steps",
        title="Small steps during low-mood days",
        category="low-mood",
        summary=(
            "Keep expectations realistic and focus on "
            "basic achievable actions."
        ),
        content=[
            (
                "Choose one necessary action rather than "
                "trying to recover the whole day."
            ),
            (
                "Consider food, hydration, rest and basic "
                "self-care before productivity."
            ),
            (
                "Seek professional support when low mood "
                "is persistent, worsening or difficult "
                "to manage."
            ),
        ],
        professional_support_recommended=True,
    ),
]


EXPERT_DIRECTORY: list[
    ExpertSupportEntry
] = [
    ExpertSupportEntry(
        id="general-practitioner",
        title="Primary healthcare support",
        profession=(
            "GP or primary-care clinician"
        ),
        description=(
            "A general healthcare professional can "
            "discuss mental-health concerns, assess "
            "symptoms and help identify appropriate "
            "next steps."
        ),
        suitable_for=[
            "persistent anxiety",
            "persistent low mood",
            "sleep difficulties",
            "stress affecting daily life",
        ],
        route=(
            "Use your local primary-care or healthcare "
            "service."
        ),
    ),
    ExpertSupportEntry(
        id="counselling",
        title="Counselling and psychological support",
        profession=(
            "Counsellor, therapist or psychologist"
        ),
        description=(
            "Talking therapies may help people explore "
            "emotions, behaviour, coping strategies and "
            "ongoing difficulties."
        ),
        suitable_for=[
            "anxiety",
            "stress",
            "low mood",
            "adjustment difficulties",
            "emotional wellbeing",
        ],
        route=(
            "Look for appropriately qualified services "
            "through local healthcare or recognised "
            "professional directories."
        ),
    ),
    ExpertSupportEntry(
        id="occupational-support",
        title="Occupational and functional support",
        profession=(
            "Occupational therapist or specialist support"
        ),
        description=(
            "Support can focus on daily routines, "
            "sensory needs, executive functioning and "
            "participation in study, work or everyday "
            "activities."
        ),
        suitable_for=[
            "sensory difficulties",
            "executive-function challenges",
            "daily-living difficulties",
            "work or study adjustments",
        ],
        route=(
            "Ask your healthcare, education or workplace "
            "support service about appropriate referral "
            "routes."
        ),
    ),
]


SAFEGUARDING = SafeguardingGuide(
    title="Safety and safeguarding",
    principles=[
        (
            "Aksess is a wellbeing-support tool and does "
            "not replace qualified medical or mental-"
            "health care."
        ),
        (
            "Users should not rely on automated insights "
            "to diagnose a health condition."
        ),
        (
            "Community and AI features must never present "
            "themselves as emergency-response services."
        ),
        (
            "Users should be able to report harmful "
            "community content and control whether "
            "advanced data processing is enabled."
        ),
        (
            "Sensitive features such as wearables, voice "
            "processing and research sharing remain "
            "opt-in."
        ),
    ],
    urgent_message=(
        "If you or someone else is in immediate danger, "
        "contact your local emergency services or seek "
        "urgent professional help."
    ),
)


def list_resources() -> list[SupportResource]:
    return RESOURCES


def list_expert_support() -> list[
    ExpertSupportEntry
]:
    return EXPERT_DIRECTORY


def read_safeguarding() -> SafeguardingGuide:
    return SAFEGUARDING
