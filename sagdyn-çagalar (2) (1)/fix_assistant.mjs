import fs from 'fs';

let content = fs.readFileSync('src/context/LanguageContext.tsx', 'utf-8');

content = content.replace(
  /'qa\.thinking': 'Pikirlenýär\.\.\.',/g,
  "'qa.thinking': 'Pikirlenýär...', 'qa.assistant': 'Kömekçi',"
);

content = content.replace(
  /'qa\.thinking': 'Думает\.\.\.',/g,
  "'qa.thinking': 'Думает...', 'qa.assistant': 'Ассистент',"
);

content = content.replace(
  /'qa\.thinking': 'Thinking\.\.\.',/g,
  "'qa.thinking': 'Thinking...', 'qa.assistant': 'Assistant',"
);

content = content.replace(
  /'qa\.thinking': 'Denkt nach\.\.\.',/g,
  "'qa.thinking': 'Denkt nach...', 'qa.assistant': 'Assistent',"
);

content = content.replace(
  /'qa\.thinking': '생각 중\.\.\.',/g,
  "'qa.thinking': '생각 중...', 'qa.assistant': '어시스턴트',"
);

fs.writeFileSync('src/context/LanguageContext.tsx', content);
