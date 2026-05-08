import { ExternalLink } from "lucide-react";
import { BsInstagram, BsTwitter } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa";
import { GiThunderBlade } from "react-icons/gi";
import { LiaLinkedinIn } from "react-icons/lia";


type SocialLinkItem = {
  name: string;
  username: string;
  url: string;
  icon: React.ElementType;
  color: string;
};

const socialLinks: SocialLinkItem[] = [
  {
    name: "Facebook",
    username: "@ashiknow3",
    url: "https://www.facebook.com/ashiknow3",
    icon: FaFacebook,
    color: "#1877F2",
  },

  {
    name: "LinkedIn",
    username: "/in/ashikali0",
    url: "https://www.linkedin.com/in/ashikali0",
    icon: LiaLinkedinIn,
    color: "#0A66C2",
  },

  {
    name: "X",
    username: "@ashiknow",
    url: "https://x.com/ashiknow",
    icon: BsTwitter,
    color: "#ffffff",
  },

  {
    name: "Instagram",
    username: "@ashiknow3",
    url: "https://www.instagram.com/ashiknow3/",
    icon: BsInstagram,
    color: "#E1306C",
  },

  {
    name: "GitHub",
    username: "@ashik-ashik",
    url: "https://github.com/ashik-ashik",
    icon: GiThunderBlade,
    color: "#f5f5f5",
  },
];

export default function SocialLinksSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Social Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;

            return (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group relative overflow-hidden
                  rounded-3xl
                  border border-white/10
                  bg-transparent
                  backdrop-blur-sm
                  p-6
                  transition-all duration-500
                  hover:-translate-y-2
                  hover:border-white/20
                  hover:shadow-[0_0_50px_rgba(255,255,255,0.05)]
                "
              >
                {/* Glow Effect */}
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-all duration-500"
                  style={{ background: social.color }}
                />

                {/* Bottom Gradient Border */}
                <div
                  className="absolute inset-x-0 bottom-0 h-[2px]"
                  style={{
                    background: `linear-gradient(to right, transparent, ${social.color}, transparent)`,
                  }}
                />

                {/* Top Section */}
                <div className="relative z-10 flex items-start justify-between">
                  <div
                    className="w-16 h-16 rounded-2xl border flex items-center justify-center backdrop-blur-md"
                    style={{
                      borderColor: `${social.color}55`,
                      backgroundColor: `${social.color}10`,
                    }}
                  >
                    <Icon
                      size={30}
                      style={{ color: social.color }}
                      strokeWidth={2.2}
                    />
                  </div>

                  <ExternalLink
                    size={18}
                    className="text-zinc-500 transition-all duration-300 group-hover:text-white"
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 mt-6">
                  <h3 className="text-2xl font-semibold text-white">
                    {social.name}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-400">
                    {social.username}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition-all duration-300 group-hover:text-white">
                    Visit Profile
                    <ExternalLink size={15} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}