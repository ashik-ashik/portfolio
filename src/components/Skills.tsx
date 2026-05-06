import Card from "./Card";
import SectionWrapper from "./SectionWrapper";
export type Skill = {
  name: string;
};

type Props = {
  Skills: Skill[];
};

const SkillsSection = ({ Skills }: Props) => {
  return (
    <SectionWrapper title="Skills">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Skills.map((skill, i) => (
          <Card key={i}>
            <p className="text-center text-gray-700 dark:text-gray-200">
              {skill.name}
            </p>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default SkillsSection;