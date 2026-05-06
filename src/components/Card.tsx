type Props = {
  children: React.ReactNode;
};

const Card = ({ children }: Props) => {
  return (
    <div className="p-4 rounded-xl bg-white/10 dark:bg-white/10 border border-white/10 hover:bg-white/20 transition">
      {children}
    </div>
  );
};

export default Card;