from enum import Enum


class HateSpeechType(Enum):
    NO_HATE = "No Hate"
    NEGATIVE_STEREOTYPING = "Negative Stereotyping"
    DEHUMANIZATION = "Dehumanization"
    VIOLENCE_KILLING = "Violence & Killing"
    EQUATION = "Equation"
    NORMALIZATION = "Normalization of Existing Discrimination"
    IRONY = "Disguise as Irony"
    SLANDER = "Harmful Slander"
    SKIP = "Skip"
    NOT_PROCESSED = 'Not Processed'

