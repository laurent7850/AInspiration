"""Generate the free guide "Dix questions à se poser avant d'automatiser quoi que ce soit".

The first version (16/09/2026) was produced by a script that was never kept, so a
one-word fix to its footer meant rebuilding it. This script rebuilds it faithfully
(same text, fonts, sizes and colours, read from the original PDF) and is the source
of truth from now on.

Usage (from the repository root):
    python -m pip install reportlab
    python scripts/guides/dix_questions.py

Writes public/guides/dix-questions-avant-d-automatiser.pdf, which Vite copies to
dist/ and the site serves at /guides/dix-questions-avant-d-automatiser.pdf.
"""

import re
from pathlib import Path

from reportlab.lib.colors import Color
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "public" / "guides" / "dix-questions-avant-d-automatiser.pdf"

# Registered seat of Distr'Action SRL — the site says "Basé à Givry" everywhere.
LOCALITY = "Givry"
FOOTER_LEFT = f"AInspiration — Distr’Action SRL, {LOCALITY}"
FOOTER_RIGHT = "ainspiration.eu"

for name in ("Light", "Medium", "Bold", "Italic"):
    pdfmetrics.registerFont(TTFont(f"Poppins-{name}", str(HERE / "fonts" / f"Poppins-{name}.ttf")))

INK = Color(0.07, 0.10, 0.16)
MUTED = Color(0.42, 0.47, 0.55)
NOTE = Color(0.20, 0.40, 0.38)
NUMBER = Color(0.85098, 0.901961, 0.890196)
BAR = Color(0.16, 0.66, 0.58)
RULE = Color(0.87, 0.89, 0.92)

MARGIN = 62.3622  # 22 mm, as in the original
NUMBER_COL = 45.35433  # 16 mm
FRAME_PADDING = 6  # reportlab Frame default

title = ParagraphStyle("title", fontName="Poppins-Bold", fontSize=21.5, leading=27, textColor=INK)
subtitle = ParagraphStyle(
    "subtitle", fontName="Poppins-Light", fontSize=12.5, leading=17, textColor=MUTED, spaceBefore=4
)
body = ParagraphStyle(
    "body", fontName="Poppins-Light", fontSize=10.6, leading=16, textColor=INK, alignment=TA_JUSTIFY
)
number = ParagraphStyle("number", fontName="Poppins-Bold", fontSize=26, leading=27, textColor=NUMBER)
question = ParagraphStyle("question", fontName="Poppins-Medium", fontSize=12.2, leading=16.5, textColor=INK)
answer = ParagraphStyle(
    "answer",
    fontName="Poppins-Light",
    fontSize=10.2,
    leading=15.6,
    textColor=INK,
    alignment=TA_JUSTIFY,
    spaceBefore=3,
)
note = ParagraphStyle(
    "note",
    fontName="Poppins-Light",
    fontSize=9.6,
    leading=14.2,
    textColor=NOTE,
    alignment=TA_JUSTIFY,
    leftIndent=9,
    spaceBefore=8,
)
heading = ParagraphStyle(
    "heading", fontName="Poppins-Bold", fontSize=14, leading=19, textColor=INK, spaceBefore=6, spaceAfter=6
)
signature = ParagraphStyle("signature", fontName="Poppins-Light", fontSize=9.2, leading=13.6, textColor=MUTED)
link = ParagraphStyle("link", parent=signature, textColor=BAR)
disclaimer = ParagraphStyle(
    "disclaimer", fontName="Poppins-Italic", fontSize=8.2, leading=12, textColor=MUTED, spaceBefore=10
)

INTRO = [
    "Ce document ne vend rien et ne demande rien. Ce sont les dix questions que je pose à un "
    "dirigeant quand j’arrive dans son entreprise pour regarder ce qui peut être automatisé. "
    "Elles ne parlent pas de technologie : elles parlent de votre organisation. Vous pouvez les "
    "poser vous-même, à vos équipes ou à vous-même, et faire le tri sans moi.",
    "Une remarque avant de commencer. La plupart des automatisations qui échouent "
    "n’échouent pas pour des raisons techniques : elles échouent parce qu’on a automatisé "
    "un processus que personne n’avait pris la peine de décrire. Les questions ci-dessous "
    "servent d’abord à cela — décrire avant d’outiller.",
]

QUESTIONS = [
    (
        "La tâche revient-elle souvent, et combien de temps prend-elle à chaque fois ?",
        "Multipliez la fréquence par la durée. Une tâche d’une heure qui revient deux fois par an "
        "ne mérite aucun investissement ; une tâche de six minutes répétée quarante fois par semaine "
        "en mérite un. C’est le seul critère d’entrée, et il élimine la moitié des idées d’emblée.",
        "Si personne ne sait répondre, c’est déjà une information : ce qui n’est pas compté "
        "n’est pas piloté.",
    ),
    (
        "La règle qui gouverne cette tâche est-elle écrite quelque part ?",
        "Demandez qu’on vous montre le document. Dans presque tous les cas, il n’existe pas : "
        "la règle vit dans la tête de la personne qui fait le travail, avec ses exceptions, ses "
        "« sauf si » et ses arrangements avec certains clients.",
        "Une machine ne devine pas une règle non écrite. Si elle ne l’est pas, l’écrire est le "
        "premier chantier — et il a de la valeur même si vous n’automatisez jamais.",
    ),
    (
        "Où l’information est-elle ressaisie ?",
        "Suivez une donnée du moment où elle entre jusqu’au moment où elle sert. Comptez les fois "
        "où quelqu’un la retape, la copie, l’imprime ou la recopie d’un écran vers un autre.",
        "Ce sont les ruptures qui coûtent cher, pas les tâches. Et ce sont elles qu’une "
        "automatisation supprime réellement — souvent sans qu’on touche au métier lui-même.",
    ),
    (
        "Que se passe-t-il quand ça rate aujourd’hui, et comment vous en apercevez-vous ?",
        "Posez la question au passé, pas au conditionnel : « la dernière fois que ça s’est mal "
        "passé, comment l’avez-vous su ? » La réponse est souvent « le client nous a appelés ».",
        "Si une erreur n’est détectée par personne aujourd’hui, elle ne le sera pas davantage "
        "demain — elle sera seulement produite plus vite. Automatiser sans contrôle multiplie le "
        "problème.",
    ),
    (
        "Qui décide, dans cette chaîne, et sur quoi ?",
        "Identifiez chaque point où quelqu’un juge : accorder une remise, valider une dépense, "
        "choisir entre deux traitements. Notez qui, et sur quels éléments.",
        "Ces points-là ne s’automatisent pas — ils se préparent. Une bonne automatisation "
        "apporte à la personne tout ce qu’il lui faut pour décider en dix secondes ; elle ne "
        "décide pas à sa place.",
    ),
    (
        "Vos données sont-elles regardables ?",
        "Ouvrez le fichier ou l’écran et regardez cent lignes au hasard. Pas la description "
        "qu’on vous en fait : les lignes elles-mêmes. Champs vides, doublons, dates au mauvais "
        "format, noms orthographiés de trois façons.",
        "La qualité réelle des données décide du calendrier bien plus que le choix de l’outil. "
        "Un projet qui l’ignore découvre le problème à mi-parcours, au pire moment.",
    ),
    (
        "Avez-vous déjà essayé, et pourquoi cela n’a-t-il pas marché ?",
        "Presque toutes les entreprises ont une tentative précédente : un logiciel abandonné, un "
        "tableur qui devait tout régler, un prestataire parti en cours de route.",
        "Le motif de l’échec précédent est le meilleur prédicteur du suivant. S’il tenait à "
        "l’adoption par les équipes plutôt qu’à la technique, changer d’outil ne changera rien.",
    ),
    (
        "Qu’est-ce qui ne doit surtout pas changer ?",
        "Certaines choses tiennent l’entreprise : un contact direct avec un client, une "
        "vérification faite par une personne précise, un délai tenu à la main.",
        "Ce qu’on n’a pas le droit de toucher se sait avant, pas après. C’est aussi ce qui "
        "protège l’adoption : une équipe qui voit qu’on n’a pas touché à l’essentiel suit "
        "beaucoup plus volontiers.",
    ),
    (
        "Des données personnelles entrent-elles dans le processus, et sortent-elles de "
        "l’Union européenne ?",
        "Nom, adresse, courriel, dossier, enregistrement d’appel : dès qu’une personne est "
        "identifiable, vous traitez des données personnelles. Vérifiez ensuite où tourne l’outil "
        "envisagé.",
        "Cela ne bloque presque jamais un projet, mais cela en change le cadre : contrat de "
        "sous-traitance, durée de conservation, information des personnes. Traité au début, "
        "c’est une formalité ; découvert à la fin, c’est un report.",
    ),
    (
        "À quoi verrez-vous, dans six mois, que ça valait la peine — et l’avez-vous mesuré "
        "avant ?",
        "Choisissez un nombre, un seul : des heures, des délais, un taux d’erreur, un nombre de "
        "relances. Puis relevez sa valeur actuelle, aujourd’hui, avant de commencer quoi que ce "
        "soit.",
        "C’est la question qu’on oublie et c’est la plus coûteuse. Sans point de départ "
        "mesuré, personne ne pourra dire si le projet a réussi — et vous n’aurez rien à "
        "montrer la fois suivante.",
    ),
]

CLOSING = [
    "C’est le cas le plus fréquent, et ce n’est pas un mauvais signe : ces réponses ne sont "
    "réunies nulle part dans une entreprise qui tourne. Prenez-les dans l’ordre, une par "
    "semaine, en interrogeant les personnes qui font réellement le travail — ce sont elles qui "
    "décrivent le mieux les processus, mieux que ceux qui les ont définis.",
    "Si vous préférez qu’on les prenne ensemble, je propose un appel de trente minutes, gratuit "
    "et sans engagement : on regarde vos processus et je vous dis franchement ce qui est jouable, "
    "ce qui ne l’est pas, et par quoi commencer. Pas de rapport à la clé, pas de relance "
    "commerciale — trente minutes et une réponse claire.",
]


NBSP = " "


def fr(text: str) -> str:
    """French typography: no-break space inside guillemets and before ? ! : ;"""
    text = text.replace("« ", "«" + NBSP).replace(" »", NBSP + "»")
    return re.sub(r" ([?!:;])", lambda m: NBSP + m.group(1), text)


def P(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(fr(text), style)


def item(index: int, q: str, a: str, n: str) -> KeepTogether:
    right = [
        P(q, question),
        P(a, answer),
        P(f"Ce que la réponse vous dit. {n}", note),
    ]
    table = Table(
        [[Paragraph(f"{index:02d}", number), right]],
        colWidths=[NUMBER_COL, A4[0] - 2 * MARGIN - NUMBER_COL],
    )
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return KeepTogether([table, Spacer(1, 18)])


def decorate(canvas, doc) -> None:
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(BAR)
    canvas.rect(0, 0, 4.5, height, stroke=0, fill=1)
    canvas.setFillColor(MUTED)
    canvas.setFont("Poppins-Light", 7.8)
    canvas.drawString(MARGIN, 34.01575, FOOTER_LEFT)
    canvas.drawRightString(width - MARGIN, 34.01575, FOOTER_RIGHT)
    if doc.page > 1:
        canvas.drawCentredString(width / 2, 34.01575, f"— {doc.page} —")
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 43.93701, width - MARGIN, 43.93701)
    canvas.restoreState()


def build() -> Path:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        # The platypus frame pads its content by 6 pt on every side: take it off the
        # page margins so the text starts at MARGIN, exactly as in the original.
        leftMargin=MARGIN - FRAME_PADDING,
        rightMargin=MARGIN - FRAME_PADDING,
        topMargin=20 * mm - FRAME_PADDING,
        bottomMargin=22 * mm - FRAME_PADDING,
        title="Dix questions à se poser avant d’automatiser quoi que ce soit",
        author="Laurent Marechal — AInspiration",
        subject="Guide de réflexion avant un projet d’automatisation",
        creator="AInspiration — scripts/guides/dix_questions.py",
    )
    story = [
        Paragraph("Dix questions à se poser avant<br/>d’automatiser quoi que ce soit", title),
        Paragraph("Les questions que je pose lors d’un diagnostic, dans l’ordre où je les pose.", subtitle),
        Spacer(1, 16),
    ]
    for text in INTRO:
        story += [P(text, body), Spacer(1, 8)]
    story.append(Spacer(1, 14))
    for i, (q, a, n) in enumerate(QUESTIONS, start=1):
        story.append(item(i, q, a, n))
        if i in (3, 8):  # same page breaks as the original
            story.append(PageBreak())
    story += [Spacer(1, 6), P("Et si les réponses vous manquent", heading)]
    for text in CLOSING:
        story += [P(text, body), Spacer(1, 8)]
    story += [
        Spacer(1, 10),
        Paragraph(
            f"Laurent Marechal — AInspiration, marque de Distr’Action SRL, {LOCALITY} (Belgique).<br/>"
            "Conseil en intelligence artificielle et automatisation pour les PME.",
            signature,
        ),
        Paragraph('<link href="https://ainspiration.eu">ainspiration.eu</link>', link),
        Paragraph(
            "Ce document est un guide de réflexion. Il ne constitue ni un conseil juridique, ni un "
            "audit, ni une garantie de résultat.",
            disclaimer,
        ),
    ]
    doc.build(story, onFirstPage=decorate, onLaterPages=decorate)
    return OUT


if __name__ == "__main__":
    print(build())
