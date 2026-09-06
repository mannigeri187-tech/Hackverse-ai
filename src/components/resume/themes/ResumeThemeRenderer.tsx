import type { ResumeData, ResumeThemeId } from '../../../types/resumeBuilder';
import { ATSProTheme } from './ATSProTheme';
import { ModernTheme } from './ModernTheme';
import { TechTheme } from './TechTheme';

interface Props {
  data: ResumeData;
  theme: ResumeThemeId;
}

export function ResumeThemeRenderer({ data, theme }: Props) {
  switch (theme) {
    case 'modern':
      return <ModernTheme data={data} />;
    case 'tech':
      return <TechTheme data={data} />;
    case 'ats-pro':
    default:
      return <ATSProTheme data={data} />;
  }
}
