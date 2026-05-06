type Props = {
  title: string;
  children: React.ReactNode;
};

const SectionWrapper = ({ title, children }: Props) => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          {title}
        </h2>

        <div className="bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          {children}
        </div>

      </div>
    </section>
  );
};

export default SectionWrapper;