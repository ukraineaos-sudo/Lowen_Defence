/**
 * TeamSection.tsx — команда інструкторів
 */
"use client";

import React from "react";
import type { ResolvedTeamMember } from "@/lib/i18n/resolve-content";
import { ResponsiveImage } from "./ResponsiveImage";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface TeamSectionProps {
  team: ResolvedTeamMember[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({ team }) => {
  const { dict } = useI18n();

  const activeMembers = team
    .filter((m) => m.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="team" id="team">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">{dict.team.eyebrow}</span>
            <h2>{dict.team.title}</h2>
          </div>
          <p className="section-lead">{dict.team.lead}</p>
        </div>

        <div className="team-grid">
          {activeMembers.map((member) => (
            <article key={member.id} className="member">
              <div className="member-photo">
                <ResponsiveImage
                  image={member.image}
                  fallbackAlt={member.name}
                />
              </div>
              <h3>{member.name}</h3>
              <p>{member.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
