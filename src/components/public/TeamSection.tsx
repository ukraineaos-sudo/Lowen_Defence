/**
 * TeamSection.tsx — команда інструкторів
 */
import React from "react";
import { TeamMember } from "../../types/content";
import { ResponsiveImage } from "./ResponsiveImage";

interface TeamSectionProps {
  team: TeamMember[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({ team }) => {
  const activeMembers = team
    .filter((m) => m.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="team" id="team">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Команда</span>
            <h2>Löwen Defence Україна</h2>
          </div>
          <p className="section-lead">
            Міжнародна експертиза, українське партнерство та спільна мета — навчати
            безпеки так, щоб люди ставали сильнішими, а не наляканими.
          </p>
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
