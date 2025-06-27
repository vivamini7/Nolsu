import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './MainPage';
import SurveyPage from './SurveyPage';
import SurveyPage2 from './SurveyPage2'; 
import SurveyPage3 from './SurveyPage3'; 
import SurveyPage4 from './SurveyPage4'; 
import SurveyPage5 from './SurveyPage5'; 
import RecommendationPage from './Recommendation';
import Result from './Result';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/survey2" element={<SurveyPage2 />} /> {/* 추가 */}
        <Route path="/survey3" element={<SurveyPage3 />} />
        <Route path="/survey4" element={<SurveyPage4 />} />
        <Route path="/survey5" element={<SurveyPage5 />} />
        <Route path="/recommendation" element={<RecommendationPage />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}
