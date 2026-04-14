import { useSelector } from 'react-redux';
import { VIEWS } from '@/utils';
import { HomePage } from '@/pages/Home/HomePage';
import { ParticipantPage } from '@/pages/Participant';
import { StepperPage } from '@/pages/Stepper';
import type { RootState } from '@/store';
import NavBar from '../components/NavBar/NavBar';
import '../style/main.scss';

export const AppRouter = () => {
  const { view } = useSelector((state: RootState) => state.view);

  return (
    <main className='main-container'>
      <NavBar />
      {view === VIEWS.HOME && <HomePage />}
      {view === VIEWS.PARTICIPANT && <ParticipantPage />}
      {view === VIEWS.STEPPER && <StepperPage />}
    </main>
  );
}
