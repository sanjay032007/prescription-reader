"""
Generate a sample printed prescription image for testing the app.
Saves to /home/z/my-project/download/sample-prescription.png
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.font_manager as fm
fm.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
fm.fontManager.addfont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')

import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

# Prescription content
rx_content = [
    ("Dr. Anita Sharma, MBBS, MD", "header"),
    ("Riverside Family Clinic   |   Reg No: KMC-44721", "subheader"),
    ("Date: 14 August 2025", "subheader"),
    ("", "spacer"),
    ("Patient: Mr. Ramesh Kumar     Age: 42   M", "patient"),
    ("Complaints: Fever 101°F, body ache, dry cough x 3 days", "complaint"),
    ("", "spacer"),
    ("Rx", "rxsymbol"),
    ("1. Tab Dolo 650  -  1 tab PO BD x 5 days, after meals", "drug"),
    ("2. Tab Azithromycin 500  -  1 tab OD x 3 days, after meals", "drug"),
    ("3. Cap Pan-D  -  1 cap OD before breakfast x 5 days", "drug"),
    ("4. Syrup Benadryl  -  2 tsp HS x 5 days", "drug"),
    ("", "spacer"),
    ("Follow up after 5 days. Plenty of fluids, rest.", "advice"),
    ("", "spacer"),
    ("[Signed]", "sign"),
    ("Dr. Anita Sharma", "signname"),
]

fig, ax = plt.subplots(figsize=(8.5, 11), dpi=150)
fig.patch.set_facecolor("white")
ax.set_facecolor("white")
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis("off")

y = 0.96
for text, kind in rx_content:
    if kind == "header":
        ax.text(0.5, y, text, fontsize=16, fontweight="bold",
                ha="center", color="#0c1a2e")
        y -= 0.025
    elif kind == "subheader":
        ax.text(0.5, y, text, fontsize=9, ha="center", color="#64748b")
        y -= 0.022
    elif kind == "patient":
        ax.text(0.08, y, text, fontsize=11, fontweight="bold", color="#0c1a2e")
        y -= 0.035
    elif kind == "complaint":
        ax.text(0.08, y, text, fontsize=10, color="#475569")
        y -= 0.04
    elif kind == "spacer":
        y -= 0.02
    elif kind == "rxsymbol":
        ax.text(0.08, y, "\u211E", fontsize=22, fontweight="bold", color="#0c1a2e")
        y -= 0.04
    elif kind == "drug":
        ax.text(0.1, y, text, fontsize=11, color="#0c1a2e")
        y -= 0.04
    elif kind == "advice":
        ax.text(0.08, y, text, fontsize=10, color="#475569", style="italic")
        y -= 0.035
    elif kind == "sign":
        ax.text(0.7, y, text, fontsize=10, color="#475569")
        y -= 0.02
    elif kind == "signname":
        ax.text(0.65, y, text, fontsize=11, fontweight="bold", color="#0c1a2e")
        y -= 0.02

# Stamp circle on top of signature
from matplotlib.patches import Circle
circle = Circle((0.83, 0.07), 0.05, fill=False, edgecolor="#0891b2",
                linewidth=2.5, linestyle="-")
ax.add_patch(circle)
ax.text(0.83, 0.07, "APPROVED", fontsize=6, ha="center", va="center",
        color="#0891b2", fontweight="bold", rotation=15)

plt.savefig("/home/z/my-project/download/sample-prescription.png",
            facecolor="white", bbox_inches="tight", pad_inches=0.4)
plt.close()
print("Saved sample prescription image")
