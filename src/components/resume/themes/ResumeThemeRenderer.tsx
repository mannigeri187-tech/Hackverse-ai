import type { ResumeData, ResumeThemeId } from '../../../types/resumeBuilder';
import { ATSProTheme } from './ATSProTheme';
import { ModernTheme } from './ModernTheme';
import { TechTheme } from './TechTheme';
import { MinimalistTheme } from './MinimalistTheme';
import { EngineeringTheme } from './EngineeringTheme';
import { CreativeTheme } from './CreativeTheme';

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
    case 'minimalist':
      return <MinimalistTheme data={data} />;
    case 'engineering':
      return <EngineeringTheme data={data} />;
    case 'creative':
      return <CreativeTheme data={data} />;
    case 'ats':
      return <ATSProTheme data={data} />;
    default:
      throw new Error(`ResumeThemeRenderer: Missing theme mapping for ID "${theme}"`);
  }
}
