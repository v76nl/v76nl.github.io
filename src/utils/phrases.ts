// 日本語の見出しを、折り返してよい語句の単位に分ける。
// ブラウザや Satori は日本語を文字単位で折り返し「レポー/ト」のような改行になるため、
// 語句の切れ目でだけ改行できるようにする (OGP画像と記事のタイトルで使う)。

export type Phrase = { text: string; space: boolean };

export function phrases(str: string): Phrase[] {
    const seg = new Intl.Segmenter('ja', { granularity: 'word' });
    const out: Phrase[] = [];
    for (const { segment } of seg.segment(str)) {
        const prev = out[out.length - 1];
        if (/^\s+$/.test(segment)) {
            if (prev) prev.space = true;
            continue;
        }
        // 短いひらがな (助詞など) と句読点は前の語句にくっつける
        const attach =
            prev &&
            !prev.space &&
            (/^[\u3041-\u3096ー]{1,3}$/.test(segment) ||
                /^[、。！？」』）・：,.!?)]+$/.test(segment));
        if (attach) prev.text += segment;
        else out.push({ text: segment, space: false });
    }
    return out;
}
