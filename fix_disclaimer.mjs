import fs from 'fs';

let content = fs.readFileSync('src/context/LanguageContext.tsx', 'utf-8');

content = content.replace(
  /'qa\.disclaimer': '\(Men Türkmen, Rus, Iňlis we Nemes dillerinde gürleşip bilýärin\)',/g,
  "'qa.disclaimer': '(Men Türkmen, Rus, Iňlis, Nemes we Koreý dillerinde gürleşip bilýärin)',"
);

content = content.replace(
  /'qa\.disclaimer': '\(Я говорю на туркменском, русском, английском и немецком языках\)',/g,
  "'qa.disclaimer': '(Я говорю на туркменском, русском, английском, немецком и корейском языках)',"
);

content = content.replace(
  /'qa\.disclaimer': '\(I can speak Turkmen, Russian, English, and German\)',/g,
  "'qa.disclaimer': '(I can speak Turkmen, Russian, English, German, and Korean)',"
);

content = content.replace(
  /'qa\.disclaimer': '\(Ich spreche Turkmenisch, Russisch, Englisch und Deutsch\)',/g,
  "'qa.disclaimer': '(Ich spreche Turkmenisch, Russisch, Englisch, Deutsch und Koreanisch)',"
);

fs.writeFileSync('src/context/LanguageContext.tsx', content);
