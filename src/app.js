(function () {
  'use strict';

  //api links
  const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
  const EXAMPLE_INPUT = 'https://commons.wikimedia.org/wiki/File:Kievitsbloem.jpg\nFile:Example_zh.svg';

  const state = {
    input: EXAMPLE_INPUT,
    titles: [],
    items: [],
    loading: false,
    copied: false,
    options: {
      includeSeparators: false,
      includeOptionalEmptyFields: false,
      licenseFullText: false,
      includeLinkTexts: true,
      inputAuthor: '',
      inputAuthorValue: false,
      licenseBoxTheme: false,
    },
  };

  //Ui vars//
  const els = {
    input: document.querySelector('#link-input'),
    loadExample: document.querySelector('#load-example'),
    fetchButton: document.querySelector('#fetch-button'),
    detectedCount: document.querySelector('#detected-count'),
    detectedList: document.querySelector('#detected-list'),
    errorBox: document.querySelector('#error-box'),
    summaryGrid: document.querySelector('#summary-grid'),
    countTotal: document.querySelector('#count-total'),
    countGreen: document.querySelector('#count-green'),
    countYellow: document.querySelector('#count-yellow'),
    countRed: document.querySelector('#count-red'),
    resultsPanel: document.querySelector('#results-panel'),
    resultsStack: document.querySelector('#results-stack'),
    outputPanel: document.querySelector('#output-panel'),
    output: document.querySelector('#output'),
    copyWarning: document.querySelector('#copy-warning'),
    includeSeparators: document.querySelector('#include-separators'),
    includeEmptyFields: document.querySelector('#include-empty-fields'),
    licenseFullText: document.querySelector('#license-full-text'),
    includeLinkTexts: document.querySelector('#include-link-texts'),
    licenseBoxTheme: document.querySelector('#license-box-theme'),
    inputAuthor: document.querySelector('#input-author'),
    copyButton: document.querySelector('#copy-button'),
  };

  //language vars//
  const language = {
    // .result-card :is(.result-header, .warning-list)

    likelyOK: '可能没问题',

    needsLicenseLabel: '授权协议缺失',
    needsLicense: '未找到明确的机器可读的授权协议。',
    needsLicenseOutput: '未找到明确的机器可读的授权协议。',

    notAcceptableLabel: '禁止使用',
    notAcceptable: 'Wikimedia Commons 提供的元信息表明该文件是“非自由版权”文件或是受其他限制。',
    notAcceptableOutput: 'Wikimedia Commons 提供的元信息表明该文件是“非自由版权”文件或是受其他限制。',

    ncLicensLabel: '非商业性使用(NC)',
    ncLicense: '检测到包含“非商业性使用(NC)”的授权协议。请联系权利人取得许可。',
    ncLicenseOutput: '该文件不得用于商业目的。',

    ndLicenseLabel: '禁止演绎(ND)',
    ndLicense: '检测到包含“禁止演绎(ND)”的授权协议。请联系权利人取得许可。',
    ndLicenseOutput: '该文件不得二次修改。',

    multipleLicensesLabel: '多重授权协议',
    multipleLicenses: '检测到多个不同版本的“CC BY-SA”授权协议，请选择合适的授权协议并在验证其授权信息后修改备注。',
    multipleLicensesOutput: '该文件使用了多个不同版本的“CC BY-SA”授权协议。在当前页面推定该文件所使用的授权协议为 CC BY-SA 3.0。',

    publicDomain: '检测到该文件位于公共领域或使用了“CC 0 1.0”授权协议。',

    CreativeCommonsBY: '检测到“CC BY”授权协议。',
    CreativeCommonsBYSA: '检测到“CC BY-SA”授权协议。',

    reviewBranchRulesLabel: '注意分部守则',
    reviewBranchRules: '检测到 4.0 版本的 Creative Commons 授权协议。该授权协议与部分SCP 维基的图像使用原则不兼容，请谨慎使用。',
    reviewBranchRulesOutput: '该文件使用了 4.0 版本的 Creative Commons 授权协议。该授权协议与部分SCP 维基的图像使用规定不兼容。',

    reviewVersionLabel: '授权协议版本/条款不明',
    reviewVersion: '检测到未知版本的 Creative Commons 授权协议。请再次确认该文件所使用的授权协议的版本和（或）条款并修改备注。',
    reviewVersionOutput: '该文件使用了未知版本的 Creative Commons 授权协议。在当前页面推定该文件所使用的授权协议为 CC BY-SA 3.0。',

    reviewLicenseLabel: '授权协议兼容性存疑',
    reviewLicense: '检测到其他允许自由使用、修改、分发和商用的授权协议。但无法确定该授权协议与SCP-CN 维基的图像使用原则是否兼容，请谨慎使用。',
    reviewLicenseOutput: '该文件使用了其他允许自由使用、修改、分发和商用的授权协议。该授权协议与部分SCP 维基的图像使用规定不兼容。',
  
    reviewNeededLabel: '授权协议存疑',
    reviewNeeded: '检测到未知的授权协议。无法确定该授权协议与SCP-CN 维基的图像使用原则是否兼容，请谨慎使用。',
    reviewNeededOutput: '该文件使用了生成器无法识别的授权协议。无法确定该授权协议与各个SCP 维基的图像使用规定是否兼容。',
  
    sourceLink: '查看原页面 ↗',
    authorUNKNOWN: '佚名',

    // Additional notes

    notes: '以上内容为SCP 维基版权模块生成器从 Wikimedia Commons 中获取的元信息。',
    notesPush: '此外，请注意：',
    notesPushLicenseUrl: '授权协议链接：',
    notesPushCompatibility: '注意：',

    // licenseLabel

    unknownLicense: '未知授权协议',

    // buildEntry

    buildEntryFilename: '文件名：',
    buildEntryName: '图像名：',
    buildEntryVideoName: '视频名：',
    buildEntryAudioName: '音频名：',
    buildEntryMediaName: '媒体名：',
    buildEntryAuthor: '图像作者：',
    buildEntryVideoAuthor: '视频作者：',
    buildEntryAudioAuthor: '音频作者：',
    buildEntryMediaAuthor: '媒体作者：',
    buildEntryAuthorUNKNOWN: '未知 - 请手动复制粘贴',
    buildEntryLicense: '授权协议：',
    buildEntrySourceLink: '来源链接：',
    buildEntryDerivativeOf: '衍生自：',
    buildEntryAdditionalNotes: '备注：',

    // fieldHtml

    fieldHtmlProblemNote: '请在复制文本前解决以下问题：',

    // renderResultCard

    renderResultCardItemNotFound: '无法在 Wikimedia Commons 找到符合文件名的文件。',

    renderResultCardFilename: '页面中的文件名',
    renderResultCardName: '图像名',
    renderResultCardVideoName: '视频名',
    renderResultCardAudioName: '音频名',
    renderResultCardMediaName: '媒体名',
    renderResultCardAuthor: '作者',
    renderResultCardLicense: '授权协议',
    renderResultCardSourceLink: '来源链接',
    renderResultCardDerivativeOf: '衍生自',
    renderResultCardDerivativeOfPlaceholder: '仅适用于合成媒体/衍生物',
    renderResultCardAdditionalNotes: '备注',
    

    extractedMetadata: '获取的元信息',

    extractedMetadataArtist: '作者',
    extractedMetadataAttribution: '署名信息',
    extractedMetadataCredit: '来源',
    extractedMetadataUsageTerms: '授权协议',
    extractedMetadataLicenseURL: '授权协议链接',
    extractedMetadataCategories: '分类',

    renderDetectedTitlesBefore: '检测到 ',
    renderDetectedTitlesAfter: ' 份文件。',

    problemListErrorBefore: '：',
    problemListErrorAfter: ' 项缺失',
    problemFilename: '页面中的文件名',
    problemAuthor: '作者',
    problemLicense: '授权协议',
    problemSourceLink: '来源链接',

    setErrorA: '请输入至少一个 Wikimedia Commons 文件页面链接和（或）File:文件名。',
    setErrorB: '在向 Wikimedia Commons 获取元信息时出错。',
    setErrorC: '无法自动复制文本。请选择输出文本并手动复制。',

    fetching: '查询中…',
    fetchMetadata: '↻ 查询元信息',

    copyButtonTextContentA: '复制',
    copyButtonTextContentB: '已复制',
  };

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function stripHtml(value) {
    if (!value) return '';
    const template = document.createElement('template');
    template.innerHTML = String(value);
    template.content.querySelectorAll('script, style, sup.reference').forEach((node) => node.remove());
    return (template.content.textContent || '')
      .replace(/\[edit\]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function metaValue(extmetadata, key) {
    const raw = extmetadata && extmetadata[key] ? extmetadata[key].value : '';
    return stripHtml(raw);
  }


  function rawMetaValue(extmetadata, key) {
    return extmetadata && extmetadata[key] ? extmetadata[key].value || '' : '';
  }

  function normalizeFileTitle(raw) {
    if (!raw) return null;
    let value = String(raw).trim();
    if (!value) return null;

    value = value.replace(/^[<({\[]+/, '').replace(/[>)}\],.;]+$/, '');

    try {
      value = decodeURIComponent(value);
    } catch (_) {
      // keep original if malformed URL.
    }

    value = value.replace(/_/g, ' ').trim();

    if (/^(file|image):/i.test(value)) {
      return 'File:' + value.replace(/^(file|image):/i, '').trim();
    }

    if (/\.(png|jpe?g|gif|webp|svg|tiff?|bmp|ogg|oga|mp3|wav|webm|mp4)$/i.test(value)) {
      return 'File:' + value;
    }

    return null;
  }


  function titleFromUrl(token) {
    let url;
    try {
      url = new URL(token);
    } catch (_) {
      return normalizeFileTitle(token);
    }

    const host = url.hostname.toLowerCase();
    const path = decodeURIComponent(url.pathname || '').replace(/_/g, ' ');

    //Verify commons links
    if (host === 'commons.wikimedia.org') {
      const titleParam = url.searchParams.get('title');
      const fileFromTitleParam = normalizeFileTitle(titleParam);
      if (fileFromTitleParam) return fileFromTitleParam;

      const wikiMatch = path.match(/\/wiki\/(File:.+)$/i);
      if (wikiMatch) return normalizeFileTitle(wikiMatch[1]);

      const specialFilePathMatch = path.match(/\/wiki\/Special:FilePath\/(.+)$/i);
      if (specialFilePathMatch) return normalizeFileTitle(specialFilePathMatch[1]);
    }

    if (host.endsWith('wikimedia.org')) {
      const parts = path.split('/').filter(Boolean);
      const thumbIndex = parts.findIndex((part) => part.toLowerCase() === 'thumb');
      if (thumbIndex >= 0 && parts.length >= thumbIndex + 5) {
        return normalizeFileTitle(parts[parts.length - 2]);
      }
      const last = parts[parts.length - 1];
      return normalizeFileTitle(last);
    }

    return normalizeFileTitle(token);
  }

  function extractTitles(input) {
    const tokens = String(input || '')
      .split(/[\n\t]+/)
      .flatMap((line) => line.split(/\s+(?=https?:\/\/|File:|Image:)/i))
      .map((part) => part.trim())
      .filter(Boolean);

    return unique(tokens.map(titleFromUrl));
  }

  function chunk(items, size) {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
    return chunks;
  }

  function getFileNameFromTitle(title) {
    return String(title || '').replace(/^File:/i, '').trim();
  }

  function getNameWithoutExtension(filename) {
    return String(filename || '').replace(/\.[^.]+$/, '').trim();
  }

  function newId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'item-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }


  /*
  checking licenses from metadata, colour code based on compatibility.
  green = compatible
  yellow = review needed
  red = not compatible
  */
  function classifyCompatibility(item) {
    const text = [
      item.licenseShortName,
      item.usageTerms,
      item.license,
      item.licenseUrl,
      item.permission,
      item.categories,
      item.rawCategories,
      item.nonFree,
      item.copyrighted,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!item.licenseShortName && !item.usageTerms && !item.licenseUrl) {
      return {
        level: 'red',
        label: language.needsLicenseLabel,
        notes: [language.needsLicense],
        output: [language.needsLicenseOutput],
      };
    }

    if (/nonfree|non-free|fair use|all rights reserved/.test(text) || item.nonFree === 'true') {
      return {
        level: 'red',
        label: language.notAcceptableLabel,
        notes: [language.notAcceptable],
        output: [language.notAcceptableOutput],
      };
    }

    if (/(^|\W)(nc|noncommercial|non-commercial)(\W|$)/i.test(text)) {
      return {
        level: 'red',
        label: language.ncLicenseLabel,
        notes: [language.ncLicense],
        output: [language.ncLicenseOutput],
      };
    }

    if (/(^|\W)(nd|no derivatives|no-derivatives)(\W|$)/i.test(text)) {
      return {
        level: 'red',
        label: language.ndLicenseLabel,
        notes: [language.ndLicense],
        output: [language.ndLicenseOutput],
      };
    }

    if (/cc[-\s]*by[-\s]*sa[-\s]*4\.0[,|\s]*3\.0[,|\s]*2\.5[,|\s]*2\.0[,|\s]*1\.0/i.test(text)) {
      return {
        level: 'yellow',
        label: language.multipleLicensesLabel,
        notes: [language.multipleLicenses],
        output: [language.multipleLicensesOutput],
      };
    }

    if (/cc0|public domain|pd-|pdm|copyrighted false/.test(text)) {
      return {
        level: 'green',
        label: language.likelyOK,
        notes: [language.publicDomain],
      };
    }

    if (/cc\s*by\s*-?\s*sa\s*(1\.0|2\.0|2\.5|3\.0)/i.test(text)) {
      return {
        level: 'green',
        label: language.likelyOK,
        notes: [language.CreativeCommonsBYSA],
      };
    }

    if (/cc\s*by\s*(1\.0|2\.0|2\.5|3\.0)/i.test(text)) {
      return {
        level: 'green',
        label: language.likelyOK,
        notes: [language.CreativeCommonsBY],
      };
    }

    if (/cc\s*by\s*-?\s*sa\s*4\.0|cc\s*by\s*4\.0/i.test(text)) {
      return {
        level: 'yellow',
        label: language.reviewBranchRulesLabel,
        notes: [language.reviewBranchRules],
        output: [language.reviewBranchRulesOutput],
      };
    }

    if (/creative commons|cc-by|cc by|cc-by-sa|cc by-sa/i.test(text)) {
      return {
        level: 'yellow',
        label: language.reviewVersionLabel,
        notes: [language.reviewVersion],
        output: [language.reviewVersionOutput],
      };
    }

    if (/gfdl|gnu free documentation|free art license|fal/i.test(text)) {
      return {
        level: 'yellow',
        label: language.reviewLicenseLabel,
        notes: [language.reviewLicense],
        output: [language.reviewLicenseOutput],
      };
    }

    return {
      level: 'yellow',
      label: language.reviewNeededLabel,
      notes: [language.reviewNeeded],
      output: [language.reviewNeededOutput],
    };
  }


  function formatCommonsPageUrl(title) {
    const withUnderscores = String(title || '').replace(/ /g, '_');
    return 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(withUnderscores).replace(/%3A/i, ':');
  }

  function itemFromPage(page, sourceInput) {
    const imageInfo = page.imageinfo && page.imageinfo[0] ? page.imageinfo[0] : {};
    const ext = imageInfo.extmetadata || {};
    const title = page.title || sourceInput || '';
    const filename = getFileNameFromTitle(title);
    const objectName = metaValue(ext, 'ObjectName') || getNameWithoutExtension(filename);
    const artist = metaValue(ext, 'Artist');
    const attribution = metaValue(ext, 'Attribution');
    const credit = metaValue(ext, 'Credit');
    const licenseShortName = metaValue(ext, 'LicenseShortName');
    const usageTerms = metaValue(ext, 'UsageTerms');
    const licenseUrl = metaValue(ext, 'LicenseUrl');
    const license = metaValue(ext, 'License');
    const permission = metaValue(ext, 'Permission');
    const categories = metaValue(ext, 'Categories');
    const descriptionUrl = imageInfo.descriptionurl || formatCommonsPageUrl(title);

    //item object
    const item = {
      id: newId(),
      found: !page.missing,
      title,
      filename,
      name: objectName,
      author: attribution || artist || credit || '',
      artist,
      attribution,
      credit,
      licenseShortName,
      usageTerms,
      licenseUrl,
      license,
      permission,
      sourceLink: descriptionUrl,
      directUrl: imageInfo.url || '',
      thumbUrl: imageInfo.thumburl || imageInfo.url || '',
      mime: imageInfo.mime || '',
      width: imageInfo.width || null,
      height: imageInfo.height || null,
      copyrighted: metaValue(ext, 'Copyrighted'),
      nonFree: metaValue(ext, 'NonFree'),
      categories,
      notes: '',
      derivativeOf: '',
      rawArtist: rawMetaValue(ext, 'Artist'),
      rawLicense: rawMetaValue(ext, 'LicenseShortName') || rawMetaValue(ext, 'UsageTerms') || rawMetaValue(ext, 'License'),
    };

    if (categories && categories.includes('Files with no machine-readable author')) {
      item.author = language.authorUNKNOWN;
    }

    item.compatibility = classifyCompatibility(item);
    item.notes = buildDefaultNotes(item);
    return item;
  }

  // Default note to add to the notes section, I think this would be helpful to see which licenseboxes have utilised the wizard, so any particular issues can be reported and fixed on my end.
  function buildDefaultNotes(item) {
    const notes = [language.notes];
    if (item.licenseUrl || (item.compatibility && item.compatibility.level !== 'green')) notes.push(language.notesPush);
    if (item.licenseUrl) notes.push('\n' + '>> ' + language.notesPushLicenseUrl + item.licenseUrl);
    if (item.compatibility && item.compatibility.level !== 'green') notes.push('\n' + '>> ' + language.notesPushCompatibility + item.compatibility.output[0]);

    return unique(notes).join(' ');
  }

  // fetch the data
  async function fetchCommonsMetadata(titles) {
    const results = [];
    for (const titleChunk of chunk(titles, 25)) {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        formatversion: '2',
        origin: '*',
        prop: 'imageinfo',
        titles: titleChunk.join('|'),
        iiprop: 'url|size|mime|extmetadata',
        iiurlwidth: '360',
        redirects: '1',
      });

      const response = await fetch(COMMONS_API + '?' + params.toString());
      if (!response.ok) throw new Error('Commons API returned HTTP ' + response.status + '.');
      const data = await response.json();
      if (data.error) throw new Error(data.error.info || data.error.code || 'Commons API error.');
      const pages = data.query && data.query.pages ? data.query.pages : [];
      pages.forEach((page) => results.push(itemFromPage(page)));
    }
    return results;
  }

  function escapeWikidot(value) {
    return String(value || '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function licenseLabel(item) {
    const baseInShortName = item.licenseShortName || item.usageTerms || item.license || language.unknownLicense;
    const baseInFullText = item.usageTerms || item.license || language.unknownLicense;
    const base = state.options.licenseFullText ? baseInFullText : baseInShortName;
    return escapeWikidot(base);
  }

  //reformat entry
  function buildEntry(item) {
    const includeOptionalEmptyFields = state.options.includeOptionalEmptyFields;
    const lines = [];
    lines.push('> **' + language.buildEntryFilename + '**' + escapeWikidot(item.filename));

    const suggestedName = escapeWikidot(item.name);
    const filenameStem = getNameWithoutExtension(item.filename);
    const nameLabel = item.mime && item.mime.startsWith('video/') ? language.buildEntryVideoName : item.mime && item.mime.startsWith('audio/') ? language.buildEntryAudioName : item.mime && item.mime.startsWith('application/ogg') ? language.buildEntryMediaName : language.buildEntryName;
    const authorLabel = item.mime && item.mime.startsWith('video/') ? language.buildEntryVideoAuthor : item.mime && item.mime.startsWith('audio/') ? language.buildEntryAudioAuthor : item.mime && item.mime.startsWith('application/ogg') ? language.buildEntryMediaAuthor : language.buildEntryAuthor;
    if (includeOptionalEmptyFields || (suggestedName && suggestedName.toLowerCase() !== filenameStem.toLowerCase())) {
      lines.push('> **' + nameLabel + '**' + suggestedName);
    }

    function buildEntrySourceLink(rawlink) {
      const addBefore = state.options.includeLinkTexts ? '[*' : '';
      const addAfter = state.options.includeLinkTexts ? ' Wikimedia Commons]' : '';

      return addBefore + rawlink + addAfter;
    }

    const addedSourceLink = buildEntrySourceLink(escapeWikidot(item.sourceLink));

    lines.push('> **' + authorLabel + '**' + (escapeWikidot(item.author) || language.buildEntryAuthorUNKNOWN));
    lines.push('> **' + language.buildEntryLicense + '**' + licenseLabel(item));
    lines.push('> **' + language.buildEntrySourceLink + '**' + addedSourceLink);

    

    if (includeOptionalEmptyFields || item.notes) {
      lines.push('> **' + language.buildEntryAdditionalNotes + '**' + item.notes);
    }

    if (includeOptionalEmptyFields || item.derivativeOf) {
      lines.push('> **' + language.buildEntryDerivativeOf + '**' + escapeWikidot(item.derivativeOf));
    }

    return lines.join('\n');
  }


  // format into component markup, optional seperator as I see some authors prefer those.
  function buildLicenseBox() {
    const usable = state.items.filter((item) => item.found);
    const entries = usable.map(buildEntry);
    if (entries.length === 0) return '';

    const separator = state.options.includeSeparators ? '\n-----\n' : '\n\n';
    return [
      state.options.licenseBoxTheme ? '[[include :scp-wiki-cn:component:license-box-theme' : '[[include :scp-wiki-cn:component:license-box',
      '|lang=CN',
      state.options.inputAuthorValue ? '|author=' + state.options.inputAuthor : '',
      ']]',
      state.options.includeSeparators ? '-----' : '',
      entries.join(separator),
      state.options.includeSeparators ? '-----' : '',
      '[[include :scp-wiki-cn:component:license-box-end]]',
    ]
      .filter((line) => line !== '')
      .join('\n');
  }

  //error handling and such 

  const REQUIRED_LICENSEBOX_FIELDS = [
    ['filename', 'Filename'],
    ['author', 'Author'],
    ['licenseShortName', 'License'],
    ['sourceLink', 'Source link'],
  ];

  const REQUIRED_FIELD_NAMES = new Set(
    REQUIRED_LICENSEBOX_FIELDS.map(([key]) => key)
  );

  function isMissingLicenseboxValue(value) {
    const text = String(value || '').trim();

    return (
      !text ||
      text === '—' ||
      /unknown/i.test(text) ||
      /verify manually/i.test(text)
    );
  }

  function getItemProblems(item) {
    return REQUIRED_LICENSEBOX_FIELDS
      .filter(([key]) => isMissingLicenseboxValue(item[key]))
      .map(([, label]) => label);
  }

  function getAllProblems(items) {
    return items.flatMap((item, index) => {
      const name = item.filename || item.name || `Image ${index + 1}`;

      return getItemProblems(item).map((field) => ({
        image: name,
        field,
      }));
    });
  }

  function setError(message) {
    if (!message) {
      els.errorBox.textContent = '';
      els.errorBox.classList.add('hidden');
      return;
    }
    els.errorBox.textContent = '✕ ' + message;
    els.errorBox.classList.remove('hidden');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function statusIcon(level) {
    if (level === 'green') return '✓';
    if (level === 'red') return '✕';
    return '⚠';
  }

  function fieldHtml(item, name, label, value, options) {
    const safeOptions = options || {};
    const safeValue = escapeHtml(value || '');
    const isRequired = REQUIRED_FIELD_NAMES.has(name);
    const hasProblem = isRequired && isMissingLicenseboxValue(value);

    const fieldClass = 'field' + (hasProblem ? ' has-problem' : '');
    const problemNote = hasProblem
      ? '<small class="field-problem-note">❌ ' + language.fieldHtmlProblemNote + '</small>'
      : '';

    if (safeOptions.textarea) {
      return '<label class="' + fieldClass + '">' +
        '<span>' + escapeHtml(label) + '</span>' +
        '<textarea data-field="' + escapeHtml(name) + '" rows="3" placeholder="' + escapeHtml(safeOptions.placeholder || '') + '">' + safeValue + '</textarea>' +
        problemNote +
        '</label>';
    }

    return '<label class="' + fieldClass + '">' +
      '<span>' + escapeHtml(label) + '</span>' +
      '<input data-field="' + escapeHtml(name) + '" value="' + safeValue + '" placeholder="' + escapeHtml(safeOptions.placeholder || '') + '" />' +
      problemNote +
      '</label>';
  }

  function renderResultCard(item) {
    const status = item.compatibility || classifyCompatibility(item);
    if (!item.found) {
      return '<article class="result-card missing-card" data-id="' + escapeHtml(item.id) + '">' +
        '<div class="result-header"><div><h3>' + escapeHtml(item.title) + '</h3><p>' + language.renderResultCardItemNotFound + '</p></div>' +
        '<button type="button" class="icon-button" data-remove="' + escapeHtml(item.id) + '" aria-label="Remove result">×</button></div>' +
        '</article>';
    }

    const thumb = item.thumbUrl
      ? '<img class="thumb" src="' + escapeHtml(item.thumbUrl) + '" alt="' + item.filename + '" loading="lazy" />'
      : '<div class="thumb thumb-empty"></div>';

    const notes = (status.notes || []).map((note) => '<p><span class="small-icon">ⓘ</span>' + escapeHtml(note) + '</p>').join('');
    const dimensions = item.width && item.height ? '<span class="mini-pill">' + escapeHtml(item.width + ' × ' + item.height) + '</span>' : '';
    const mime = item.mime ? '<span class="mini-pill">' + escapeHtml(item.mime) + '</span>' : '';
    const nameLabel = item.mime && item.mime.startsWith('video/') ? language.renderResultCardVideoName : item.mime && item.mime.startsWith('audio/') ? language.renderResultCardAudioName : item.mime && item.mime.startsWith('application/ogg') ? language.renderResultCardMediaName : language.renderResultCardName;

    return '<article class="result-card" data-id="' + escapeHtml(item.id) + '">' +
      '<div class="result-header">' +
        '<div class="result-title-row">' + thumb + '<div><h3>' + escapeHtml(item.filename) + '</h3>' +
          '<div class="meta-row"><span class="status status-' + escapeHtml(status.level) + '">' + statusIcon(status.level) + ' ' + escapeHtml(status.label) + '</span>' + mime + dimensions + '</div>' +

        '<a class="text-link" href="' + escapeHtml(item.sourceLink) + '" target="_blank" rel="noreferrer">' + escapeHtml(language.sourceLink) + '</a>' +
        '</div></div>' +
        '<button type="button" class="icon-button" data-remove="' + escapeHtml(item.id) + '" aria-label="Remove result">×</button>' +
      '</div>' +
      '<div class="warning-list">' + notes + '</div>' +
      '<div class="grid fields-grid">' +
        fieldHtml(item, 'filename', language.renderResultCardFilename, item.filename) +
        fieldHtml(item, 'name', nameLabel, item.name) +
        fieldHtml(item, 'author', language.renderResultCardAuthor, item.author) +
        fieldHtml(item, 'licenseShortName', language.renderResultCardLicense, licenseLabel(item)) +
        fieldHtml(item, 'sourceLink', language.renderResultCardSourceLink, item.sourceLink) +
        fieldHtml(item, 'derivativeOf', language.renderResultCardDerivativeOf, item.derivativeOf, { placeholder: language.renderResultCardDerivativeOfPlaceholder }) +
      '</div>' +
      fieldHtml(item, 'notes', language.renderResultCardAdditionalNotes, item.notes, { textarea: true }) +
      '<details class="raw-details"><summary>' + language.extractedMetadata + '</summary>' +
        '<dl>' +
          '<dt>' + language.extractedMetadataArtist + '</dt><dd>' + escapeHtml(item.artist || '—') + '</dd>' +
          '<dt>' + language.extractedMetadataAttribution + '</dt><dd>' + escapeHtml(item.attribution || '—') + '</dd>' +
          '<dt>' + language.extractedMetadataCredit + '</dt><dd>' + escapeHtml(item.credit || '—') + '</dd>' +
          '<dt>' + language.extractedMetadataUsageTerms + '</dt><dd>' + escapeHtml(item.usageTerms || '—') + '</dd>' +
          '<dt>' + language.extractedMetadataLicenseURL + '</dt><dd>' + escapeHtml(item.licenseUrl || '—') + '</dd>' +
          '<dt>' + language.extractedMetadataCategories + '</dt><dd>' + escapeHtml(item.categories || '—') + '</dd>' +
        '</dl>' +
      '</details>' +
    '</article>';
  }


  function updateTitles() {
    state.input = els.input.value;
    state.titles = extractTitles(state.input);
  }

  function renderDetectedTitles() {
    const count = state.titles.length;
    els.detectedCount.textContent = language.renderDetectedTitlesBefore + count + language.renderDetectedTitlesAfter;
    els.detectedList.innerHTML = state.titles.map((title) => '<span>' + escapeHtml(title) + '</span>').join('');
  }

  function renderSummary() {
    const counts = {
      green: state.items.filter((item) => item.compatibility && item.compatibility.level === 'green').length,
      yellow: state.items.filter((item) => item.compatibility && item.compatibility.level === 'yellow').length,
      red: state.items.filter((item) => item.compatibility && item.compatibility.level === 'red').length,
    };
    els.countTotal.textContent = String(state.items.length);
    els.countGreen.textContent = String(counts.green);
    els.countYellow.textContent = String(counts.yellow);
    els.countRed.textContent = String(counts.red);
  }

  function renderResults() {
    els.resultsStack.innerHTML = state.items.map(renderResultCard).join('');
    els.summaryGrid.classList.toggle('hidden', state.items.length === 0);
    els.resultsPanel.classList.toggle('hidden', state.items.length === 0);
    els.outputPanel.classList.toggle('hidden', state.items.length === 0);
  }

  function updateCopyWarning() {
    if (!els.copyWarning || !els.output) return;

    const languageMap = {
        'Filename': language.problemFilename,
        'Author': language.problemAuthor,
        'License': language.problemLicense,
        'Source link': language.problemSourceLink,
    }

    const problems = getAllProblems(state.items);

    if (!problems.length) {
      els.copyWarning.classList.add('hidden');
      els.copyWarning.innerHTML = '';
      els.output.classList.remove('has-problems');
      return;
    }

    const problemList = problems
      .map((problem) => {
        const languageProblem = languageMap[problem.field] || problem.field;
        return '<p>❌ ' + escapeHtml(problem.image) + escapeHtml(language.problemListErrorBefore) + escapeHtml(languageProblem) + escapeHtml(language.problemListErrorAfter) + '</p>'
      })
      .join('');

    els.copyWarning.innerHTML =
      '<p>' + language.fieldHtmlProblemNote + '</p>' +
      problemList;

    els.copyWarning.classList.remove('hidden');
    els.output.classList.add('has-problems');
  }

  function renderOutput() {
    const output = buildLicenseBox();
    els.output.value = output;
    const lineCount = output ? output.split('\n').length + 2 : 14;
    els.output.rows = String(Math.max(14, lineCount));
    els.copyButton.disabled = !output;

    updateCopyWarning();
  }

  function renderLoading() {
    els.fetchButton.disabled = state.loading;
    els.loadExample.disabled = state.loading;
    els.fetchButton.textContent = state.loading ? language.fetching : language.fetchMetadata;

    els.fetchButton.classList.toggle('loading', state.loading);
  }

  function renderAll() {
    updateTitles();
    renderDetectedTitles();
    renderSummary();
    renderResults();
    renderOutput();
    renderLoading();
  }

  function updateItem(id, patch) {
    state.items = state.items.map((item) => {
      if (item.id !== id) return item;
      const updated = Object.assign({}, item, patch);
      updated.compatibility = classifyCompatibility(updated);
      return updated;
    });
  }

  
  async function handleFetch() {
    setError('');
    updateTitles();
    renderDetectedTitles();

    if (state.titles.length === 0) {
      setError(language.setErrorA);
      return;
    }

    state.loading = true;
    renderLoading();

    try {
      state.items = await fetchCommonsMetadata(state.titles);
      renderAll();
      document.querySelector('#results-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError(err && err.message ? err.message : language.setErrorB);
    } finally {
      state.loading = false;
      renderLoading();
    }
  }

  async function copyOutput() {
    const output = buildLicenseBox();
    if (!output) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(output);
      } else {
        els.output.focus();
        els.output.select();
        document.execCommand('copy');
      }
      els.copyButton.textContent = language.copyButtonTextContentB;
      els.copyButton.setAttribute('disabled', '');
      window.setTimeout(() => {
        els.copyButton.textContent = language.copyButtonTextContentA;
        els.copyButton.removeAttribute('disabled');
      }, 2200);
    } catch (_) {
      setError(language.setErrorC);
    }
  }


  els.input.value = EXAMPLE_INPUT;
  els.includeSeparators.checked = state.options.includeSeparators;
  els.includeEmptyFields.checked = state.options.includeOptionalEmptyFields;
  els.licenseFullText.checked = state.options.licenseFullText;
  els.includeLinkTexts.checked = state.options.includeLinkTexts;
  els.licenseBoxTheme.checked = state.options.licenseBoxTheme;
  els.inputAuthor.value = state.options.inputAuthor;

  els.input.addEventListener('input', () => {
    updateTitles();
    renderDetectedTitles();
  });

  els.loadExample.addEventListener('click', () => {
    els.input.value = EXAMPLE_INPUT;
    setError('');
    renderAll();
  });

  els.fetchButton.addEventListener('click', handleFetch);
  els.copyButton.addEventListener('click', copyOutput);

  els.includeSeparators.addEventListener('change', () => {
    state.options.includeSeparators = els.includeSeparators.checked;
    renderOutput();
  });

  els.includeEmptyFields.addEventListener('change', () => {
    state.options.includeOptionalEmptyFields = els.includeEmptyFields.checked;
    renderOutput();
  });

  els.licenseFullText.addEventListener('change', () => {
    state.options.licenseFullText = els.licenseFullText.checked;
    renderResults();
    renderOutput();
  });

  els.includeLinkTexts.addEventListener('change', () => {
    state.options.includeLinkTexts = els.includeLinkTexts.checked;
    state.items.forEach(function (item) {
      item.notes = buildDefaultNotes(item);
    });
    renderOutput();
  });

  els.licenseBoxTheme.addEventListener('change', () => {
    state.options.licenseBoxTheme = els.licenseBoxTheme.checked;
    renderOutput();
  });

  els.inputAuthor.addEventListener('keyup', () => {
    state.options.inputAuthor = els.inputAuthor.value;
    if (state.options.inputAuthor === '') {
      state.options.inputAuthorValue = false;
    } else {
      state.options.inputAuthorValue = true;
    }
    renderOutput();
  });

  els.resultsStack.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove]');
    if (!removeButton) return;
    const id = removeButton.getAttribute('data-remove');
    state.items = state.items.filter((item) => item.id !== id);
    renderAll();
  });

  els.resultsStack.addEventListener('input', (event) => {
    const field = event.target.getAttribute('data-field');
    if (!field) return;

    const card = event.target.closest('[data-id]');
    if (!card) return;

    updateItem(card.getAttribute('data-id'), { [field]: event.target.value });
    renderSummary();
    renderOutput();

    const fieldWrapper = event.target.closest('.field');
    if (!fieldWrapper) return;

    const hasProblem =
      REQUIRED_FIELD_NAMES.has(field) &&
      isMissingLicenseboxValue(event.target.value);

    fieldWrapper.classList.toggle('has-problem', hasProblem);

    let note = fieldWrapper.querySelector('.field-problem-note');

    if (hasProblem && !note) {
      note = document.createElement('small');
      note.className = 'field-problem-note';
      note.textContent = '❌ ' + language.fieldHtmlProblemNote;
      fieldWrapper.appendChild(note);
    }

    if (!hasProblem && note) {
      note.remove();
    }
  });

  els.resultsStack.addEventListener('change', (event) => {
    const field = event.target.getAttribute('data-field');
    if (!field) return;
    renderAll();
  });

  renderAll();
})();
