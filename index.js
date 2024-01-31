const fs = require('fs').promises;
const { XMLParser } = require('fast-xml-parser');

const RU_LOCAL_FILE_PATH = './assets/ru.kuliev.xml';
const RU_SURAH_LOCAL_FILE_PATH = './assets/ru.surah.json';
const ORIGINAL_FILE_PATH = './assets/quran-uthmani.xml';
const RESULT_FILE_PATH = './assets/quran.json';

const COPYRIGHT_BLOCK = `
// PLEASE DO NOT REMOVE OR CHANGE THIS COPYRIGHT BLOCK
//====================================================================
//
//  Tanzil Quran Text (Simple, Version 1.1)
//  Copyright (C) 2007-2023 Tanzil Project
//  License: Creative Commons Attribution 3.0
//
//  This copy of the Quran text is carefully produced, highly 
//  verified and continuously monitored by a group of specialists 
//  at Tanzil Project.
//
//  TERMS OF USE:
//
//  - Permission is granted to copy and distribute verbatim copies 
//    of this text, but CHANGING IT IS NOT ALLOWED.
//
//  - This Quran text can be used in any website or application, 
//    provided that its source (Tanzil Project) is clearly indicated, 
//    and a link is made to tanzil.net to enable users to keep
//    track of changes.
//
//  - This copyright notice shall be included in all verbatim copies 
//    of the text, and shall be reproduced appropriately in all files 
//    derived from or containing substantial portion of this text.
//
//  Please check updates at: http://tanzil.net/updates/
//
//====================================================================`;

const QURAN_FIELDS = {
  quran: 'quran',
  sura: 'surahs',
  aya: 'ayahs',
};

class XMlFileReader {
  constructor() {}

  async #readXMLFile(path) {
    const xml = await fs.readFile(path, 'utf-8');
    return xml;
  }

  async parseXML(path) {
    const xml = await this.#readXMLFile(path);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      transformTagName: (tagname) => QURAN_FIELDS[tagname] || tagname,
    });
    const object = await parser.parse(xml);

    return object;
  }
}

class JSONFileWriter {
  constructor() {}

  async writeJSONFile(path, data) {
    const jsonData = JSON.stringify(data);

    await fs.writeFile(path, jsonData);
  }
}

const concatTranslations = (original, translate, surahTranslate) => {
  const result = [];

  for (let i = 0; i < original.surahs.length; i++) {
    const surah = original.surahs[i];
    const translateSurah = translate.surahs[i];

    result.push(surah);

    result[i].localizations = { ru: surahTranslate.surahs[i]?.name };
    result[i].index = i;

    for (let j = 0; j < surah.ayahs.length; j++) {
      const ayah = surah.ayahs[j];
      const translateAyah = translateSurah.ayahs[j];

      result[i].ayahs[j] = {
        ...ayah,
        index: j,
        localizations: { ru: translateAyah.text },
      };
    }
  }

  return { copyright: COPYRIGHT_BLOCK, quran: { surahs: result } };
};

const bootstrap = async () => {
  const xmlFileReader = new XMlFileReader();
  const jsonFileWriter = new JSONFileWriter();

  const ruQuran = await xmlFileReader.parseXML(RU_LOCAL_FILE_PATH);
  const originalQuran = await xmlFileReader.parseXML(ORIGINAL_FILE_PATH);

  const ruQuranSurahJSON = await fs.readFile(RU_SURAH_LOCAL_FILE_PATH, 'utf-8');
  const ruQuranSurah = await JSON.parse(ruQuranSurahJSON);

  const quran = concatTranslations(
    originalQuran.quran,
    ruQuran.quran,
    ruQuranSurah
  );

  await jsonFileWriter.writeJSONFile(RESULT_FILE_PATH, quran);
};

bootstrap();
