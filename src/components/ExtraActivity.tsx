import {
  HeartHandshake,
  Trophy,
  Volleyball,
  BadgeCheck,
} from "lucide-react";

type ActivityItem = {
  title: string;
  organization: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tags: string[];
};

const extracurricularActivities: ActivityItem[] = [
  {
    title: "Member of PUST Sports Club",
    organization: "PUST Sports Club",
    description:
      "Active member participating in sports activities, teamwork development, and university athletic events.",
    icon: Volleyball,
    color: "#3b82f6",
    tags: ["Sports", "Teamwork", "Fitness"],
  },

  {
    title: "Vice President of HELP",
    organization: "HELP",
    description:
      "Leading volunteer activities, supporting disadvantaged communities, and organizing social welfare initiatives.",
    icon: HeartHandshake,
    color: "#22c55e",
    tags: ["Leadership", "Volunteering", "Social Work"],
  },

  {
    title: "Member of PUST Cricket Team",
    organization: "PUST Cricket Team",
    description:
      "Participated in inter-university cricket tournaments and team-based competitive sporting events.",
    icon: Trophy,
    color: "#a855f7",
    tags: ["Cricket", "Bowler", "Tournament"],
  },
];

export default function ExtracurricularActivities() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[40px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
          {extracurricularActivities.map((activity, index) => {
            const Icon = activity.icon;

            return (
              <div
                key={index}
                className="
                  group relative overflow-hidden
                  rounded-xl
                  border border-white/10
                  bg-transparent
                  backdrop-blur-sm
                  p-8
                  transition-all duration-500
                  hover:-translate-y-2
                  hover:border-white/20
                  hover:shadow-[0_0_50px_rgba(255,255,255,0.05)]
                "
              >
                {/* Animated Glow */}
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-all duration-500"
                  style={{ background: activity.color }}
                />

                {/* Border Glow */}
                <div
                  className="absolute inset-x-0 bottom-0 h-[2px]"
                  style={{
                    background: `linear-gradient(to right, transparent, ${activity.color}, transparent)`,
                  }}
                />

                {/* Icon */}
                <div
                  className="relative z-10 w-16 h-16 rounded-2xl border flex items-center justify-center backdrop-blur-md"
                  style={{
                    borderColor: `${activity.color}55`,
                    backgroundColor: `${activity.color}10`,
                  }}
                >
                  <Icon
                    size={30}
                    style={{ color: activity.color }}
                    strokeWidth={2.2}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 mt-7">
                  <h3 className="text-xl font-semibold text-white leading-relaxed">
                    {activity.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <BadgeCheck
                      size={16}
                      className="text-zinc-400"
                    />

                    <span className="text-sm text-zinc-400">
                      {activity.organization}
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-zinc-300">
                    {activity.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="relative z-10 flex flex-wrap gap-2 mt-7">
                  {activity.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="
                        px-3 py-1.5 rounded-full
                        text-xs font-medium
                        border border-white/10
                        bg-white/[0.03]
                        text-zinc-300
                        backdrop-blur-md
                        transition-all duration-300
                        hover:scale-105
                        hover:border-white/20
                      "
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}