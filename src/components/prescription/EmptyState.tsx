import { Pill, Star, Droplet } from "lucide-react";

const PREVIEW_ITEMS = [
  {
    name: "Paracetamol 650 mg",
    type: "Pain reliever / Fever reducer",
    dose: "1 tablet – 3 times a day",
    icon: Pill,
    iconBg: "#d1fae5",
    iconColor: "#059669",
    badge: "Safe",
    badgeBg: "#d1fae5",
    badgeText: "#065f46",
  },
  {
    name: "Amoxicillin 500 mg",
    type: "Antibiotic",
    dose: "1 capsule – 2 times a day after food",
    icon: Star,
    iconBg: "#fef3c7",
    iconColor: "#d97706",
    badge: "Take after food",
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
  },
  {
    name: "Levocetirizine 5 ml",
    type: "Antihistamine for allergy relief",
    dose: "5 ml – Once a day at night",
    icon: Droplet,
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
    badge: "May cause drowsiness",
    badgeBg: "#f3e8ff",
    badgeText: "#6b21a8",
  },
];

export default function EmptyState() {
  return (
    <section className="w-full px-4 sm:px-6 py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <div
            className="rounded-2xl bg-white p-6"
            style={{
              border: "1px solid var(--color-border-default)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Header */}
            <h2
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              Analysis Preview
            </h2>
            <p
              className="mt-1 mb-4"
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
              }}
            >
              Here&apos;s an example of what you&apos;ll get after analysing.
            </p>

            {/* Medication list */}
            <ul className="flex flex-col gap-4">
              {PREVIEW_ITEMS.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <li key={idx}>
                    <div className="flex items-start gap-4">
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{
                          width: 40,
                          height: 40,
                          background: m.iconBg,
                        }}
                      >
                        <Icon
                          size={20}
                          strokeWidth={2}
                          style={{ color: m.iconColor }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p
                              style={{
                                fontSize: 15,
                                fontWeight: 600,
                                color: "var(--color-text-primary)",
                              }}
                              className="truncate"
                            >
                              {m.name}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {m.type}
                            </p>
                          </div>
                          <span
                            className="rounded-md px-2 py-0.5 shrink-0"
                            style={{
                              background: m.badgeBg,
                              color: m.badgeText,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {m.badge}
                          </span>
                        </div>
                        <p
                          className="mt-1"
                          style={{
                            fontSize: 13,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          • {m.dose}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
