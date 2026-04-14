import { StepIconProps } from '@mui/material';
import { Check } from '@mui/icons-material';

const PRIMARY = '#0097A7';   // cyan-800, WCAG AA on white
const COMPLETED = '#2e7d32'; // green-800, distinct from active

export const CustomStepIcon = ({ active, completed, icon }: StepIconProps) => {
  const size = 40;

  if (completed) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: COMPLETED,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Check style={{ color: 'white', fontSize: 22 }} />
      </div>
    );
  }

  if (active) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: PRIMARY,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
      }}>
        {icon}
      </div>
    );
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: 'white',
      border: `2px solid ${PRIMARY}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: PRIMARY,
      fontWeight: 'bold',
      fontSize: 16,
    }}>
      {icon}
    </div>
  );
};
