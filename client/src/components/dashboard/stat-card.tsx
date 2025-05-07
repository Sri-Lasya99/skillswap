interface StatCardProps {
    title: string;
    value: number | string;
    subtitle: string;
    icon: string;
    variant?: 'primary' | 'secondary' | 'accent';
  }
  
  const StatCard = ({ title, value, subtitle, icon, variant = 'primary' }: StatCardProps) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return {
            text: 'text-primary',
            bg: 'bg-primary/10',
            border: 'hover:border-primary/30',
            glow: 'glow-text'
          };
        case 'secondary':
          return {
            text: 'text-secondary',
            bg: 'bg-secondary/10',
            border: 'hover:border-secondary/30',
            glow: ''
          };
        case 'accent':
          return {
            text: 'text-accent',
            bg: 'bg-accent/10',
            border: 'hover:border-accent/30',
            glow: ''
          };
        default:
          return {
            text: 'text-primary',
            bg: 'bg-primary/10',
            border: 'hover:border-primary/30',
            glow: 'glow-text'
          };
      }
    };
    
    const classes = getVariantClasses();
    
    return (
      <div className={`glass p-6 rounded-xl border border-white/5 transition-all duration-300 ${classes.border}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-muted font-medium text-sm uppercase tracking-wider">{title}</h3>
            <p className={`text-3xl font-semibold mt-2 ${classes.text} ${classes.glow}`}>{value}</p>
            <p className="text-sm text-white/70 mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${classes.bg} ${classes.text}`}>
            <i className={`${icon} text-xl`}></i>
          </div>
        </div>
      </div>
    );
  };
  
  export default StatCard;
  