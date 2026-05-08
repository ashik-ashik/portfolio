
export default function Research() {
    const researchExperience = [
    {
        title:
        "Socioeconomic Conditions and Livelihood Diversification: A Comparative Analysis Between Fishermen and Non-Fishermen Communities in Chalan Beel, Natore, Bangladesh",
        type: "Postgraduate Thesis",
        location: "Natore District, Bangladesh",
        duration: "2024-2025",
        category: "Research",
        status: "Completed",
        skills: [
        "Social Research",
        "SPSS",
        "Data Analysis",
        "Community Development",
        ],
        color: "#38bdf8",
    },

    {
        title:
        "The Socioeconomic Impact of Price Hike over the Lower and Lower Middle Class People in Pabna Municipality",
        type: "Undergraduate Thesis",
        location: "Pabna District, Bangladesh",
        duration: "2023-2024",
        category: "Research",
        status: "Completed",
        skills: [
        "Socioeconomic Analysis",
        "Survey",
        "Report Writing",
        "Data Collection",
        ],
        color: "#60a5fa",
    },

    {
        title:
        "A Random Forest-Based Predictive Model for Assessing Children’s Educational Opportunities in Fishermen Communities Using Socioeconomic and Family Factors",
        type: "Conference Paper",
        conference:
        "2nd Undergraduate Conference on Intelligent Computing and System",
        location: "Varendra University, Rajshahi",
        date: "January, 2026",
        category: "Conference",
        skills: [
        "Educational Research",
        "Data Analysis",
        ],
        color: "#8b5cf6",
    },

    {
        title:
        "Socioeconomic Condition and Livelihood Diversification of Fishermen Community in Chalan Beel",
        type: "Conference Paper",
        conference: "1st National Conference 2025",
        location: "Pabna University of Science and Technology",
        date: "June, 2025",
        category: "Conference",
        skills: [
        "Presentaion",
        "Community Research",
        "Social Development",
        ],
        color: "#ec4899",
    },
    ];

    return <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {researchExperience.map((item, index) => (
    <div
      key={index}
      className="
        group relative overflow-hidden
        rounded-xl border border-white/10
        bg-black/30
        p-6 md:p-7
        transition-all duration-500
        hover:-translate-y-1
        hover:border-cyan-400/40
        hover:shadow-[0_0_35px_rgba(34,211,238,0.12)]
      "
    >
     

      

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-[11px] tracking-wider uppercase border mb-4"
            style={{
              borderColor: `${item.color}55`,
              color: item.color,
              backgroundColor: `${item.color}12`,
            }}
          >
            {item.type}
          </span>

          <h3 className="text-[12px] md:text-md text-white leading-relaxed"
          style={{
                    fontFamily: "'Orbitron', 'Share Tech Mono', monospace",}}>
            {item.title}
          </h3>
        </div>

        
      </div>

      {/* Details */}
      <div className="relative z-10 mt-6 space-y-3">
        {item.conference && (
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Conference
            </span>
            <span className="text-zinc-200 text-sm">
              {item.conference}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Location
            </span>
            <p className="text-zinc-200 text-sm mt-1">
              {item.location}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-zinc-500">
              {item.duration ? "Duration" : "Date"}
            </span>
            <p className="text-zinc-200 text-sm mt-1">
              {item.duration || item.date}
            </p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="relative z-10 mt-6 flex flex-wrap gap-2">
        {item.skills.map((skill: string, skillIndex: number) => (
          <span
            key={skillIndex}
            className="
              px-3 py-1.5 rounded-full
              text-xs font-medium
              border border-white/10
              bg-black/20 text-zinc-200
              backdrop-blur-md
              transition-all duration-300
              hover:border-white/20
              hover:scale-105
            "
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Status */}
      {item.status && (
        <div className="relative z-10 mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
          <span className="text-zinc-500 text-xs tracking-widest uppercase">
            Status
          </span>

          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              color: item.color,
              backgroundColor: `${item.color}18`,
            }}
          >
            {item.status}
          </span>
        </div>
      )}
    </div>
  ))}
</div>
    
    
    
    
    </>


}
