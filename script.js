const SVG_NS = 'http://www.w3.org/2000/svg';

class StaffLetter {
    constructor() {
        this.svg = document.getElementById('staffSvg');
        this.W = 800;
        this.H = 1000;
        this.clefTemplate = null;
        this.clefBBox = { x: 0, y: 0, width: 24, height: 80 };
        this.clefStaffSpace = 10;
        this._measureCanvas = document.createElement('canvas');
        this._measureCtx = this._measureCanvas.getContext('2d');
        this.initElements();
        this.bindEvents();
        this.extractAbcjsClefTemplate().then(() => {
            this.render();
        }).catch(() => {
            this.render();
        });
    }

    initElements() {
        this.letterTitle = document.getElementById('letterTitle');
        this.letterContent = document.getElementById('letterContent');
        this.fontSize = document.getElementById('fontSize');
        this.lineHeight = document.getElementById('lineHeight');
        this.textColor = document.getElementById('textColor');
        this.staffColor = document.getElementById('staffColor');
        this.fontFamily = document.getElementById('fontFamily');
        this.showClef = document.getElementById('showClef');
        this.showNotes = document.getElementById('showNotes');
        this.showBorder = document.getElementById('showBorder');
        this.fontSizeValue = document.getElementById('fontSizeValue');
        this.lineHeightValue = document.getElementById('lineHeightValue');
        this.renderBtn = document.getElementById('renderBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }

    bindEvents() {
        this.fontSize.addEventListener('input', () => {
            this.fontSizeValue.textContent = this.fontSize.value + 'px';
            this.render();
        });

        this.lineHeight.addEventListener('input', () => {
            this.lineHeightValue.textContent = this.lineHeight.value + 'px';
            this.render();
        });

        [this.textColor, this.staffColor, this.fontFamily, this.showClef, this.showNotes, this.showBorder].forEach(el => {
            el.addEventListener('change', () => this.render());
        });

        this.renderBtn.addEventListener('click', () => this.render());
        this.exportBtn.addEventListener('click', () => this.exportImage());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    reset() {
        this.letterTitle.value = '给你的信';
        this.letterContent.value =
`静怡，

你好！做梦也想不到我把信写到五线谱上吧？五线谱是偶然来的，你也是偶然来的。不过我给你的信值得写在五线谱里呢。但愿我和你，是一支唱不完的歌。

谁也管不住我爱你，真的，谁管谁就真傻，我和你谁都管不住呢。你别怕，真的你谁也不要怕，最亲爱的好静怡，要爱就爱个够吧，世界上没有比爱情更好的东西了。爱一回就够了，可以死了。什么也不需要了。这话傻不傻？我觉得我的话不能孤孤单单地写在这里，你要把你的信写在空白的地方。这可不是海誓山盟。海誓山盟是把现在的东西固定住。两个人都成了活化石。我们用不着它。我们要爱情长久。真的，它要长久我们就老在一块，不分开。你明白吗？你，你，真的，和你在一起就只知道有你了，没有我，有你，多快活！

我现在一想起有人写的爱情小说就觉得可怕极了。我决心不写爱情了。你看过缪塞的《提香的儿子》吗？提香的儿子给爱人画了一幅肖像，以后终身不作画了，他把画笔给了爱了。他做得对。噢，真的，我们为什么不早认识？那样我们到现在就已经爱了好多年。多么可惜啊！爱才没够呢。

傻子才以为过家家才是爱情呢，世俗的心理真可怕。不听他们的，不听。不管天翻地覆也好，昏天黑地也好，我们到一起来寻找安谧。我觉得我提起笔来冥想的时候，还有坐在你面前的时候，都到了人所不知的世界。世界没有这个哪成呢？过去是没有它就活得没意思，现在没有你也没意思。`;
        this.fontSize.value = 22;
        this.lineHeight.value = 80;
        this.textColor.value = '#2c2c4a';
        this.staffColor.value = '#000000';
        this.fontFamily.selectedIndex = 0;
        this.showClef.checked = true;
        this.showNotes.checked = true;
        this.showBorder.checked = true;
        this.fontSizeValue.textContent = '22px';
        this.lineHeightValue.textContent = '80px';
        this.render();
    }

    exportImage() {
        const clone = this.svg.cloneNode(true);
        clone.setAttribute('xmlns', SVG_NS);
        const style = document.createElementNS(SVG_NS, 'style');
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=ZCOOL+XiaoWei&family=Noto+Serif+SC:wght@400;600&display=swap');`;
        clone.insertBefore(style, clone.firstChild);

        const serializer = new XMLSerializer();
        let src = serializer.serializeToString(clone);
        src = '<?xml version="1.0" standalone="no"?>\r\n' + src;
        const svgBlob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = this.W * 2;
            canvas.height = this.H * 2;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fffef9';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            const link = document.createElement('a');
            link.download = `五线谱信件_${this.letterTitle.value || '无题'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            alert('导出失败，请重试');
        };
        img.src = url;
    }

    extractAbcjsClefTemplate() {
        return new Promise((resolve, reject) => {
            if (typeof window.ABCJS === 'undefined' || !window.ABCJS.renderAbc) {
                reject(new Error('abcjs not loaded'));
                return;
            }
            try {
                const host = document.getElementById('__abcjs_clef_extractor__');
                if (!host) { reject(); return; }
                host.innerHTML = '';
                window.ABCJS.renderAbc(host, `X:1\nT:\nM:none\nL:1\nK:C clef=treble\nC4|]`, { staffwidth: 600, paddingleft: 30 });
                const svg = host.querySelector('svg');
                if (!svg) { reject(); return; }
                const abcStaffSpace = 10;
                this.clefStaffSpace = abcStaffSpace;

                let foundPath = null;
                const allPaths = svg.querySelectorAll('path');
                allPaths.forEach(p => {
                    const dn = (p.getAttribute('data-name') || '').toLowerCase();
                    if (dn === 'clefs.g' || dn.includes('clef')) {
                        foundPath = p;
                    }
                });
                if (!foundPath) {
                    let best = null, bestH = -1;
                    allPaths.forEach(p => {
                        const d = p.getAttribute('d') || '';
                        if (d.length < 100) return;
                        let bb = { height: 0 };
                        try { bb = p.getBBox(); } catch(e) {}
                        if (bb.height > bestH) { bestH = bb.height; best = p; }
                    });
                    foundPath = best;
                }
                if (!foundPath) { reject(); return; }

                const clonePath = foundPath.cloneNode(true);
                const bb = (() => {
                    try {
                        const tmp = document.createElementNS(SVG_NS, 'svg');
                        tmp.setAttribute('viewBox', '-100 -100 800 400');
                        const p = clonePath.cloneNode(true);
                        tmp.appendChild(p);
                        tmp.style.cssText = 'position:absolute;left:-99999px;top:-99999px';
                        document.body.appendChild(tmp);
                        const r = p.getBBox();
                        document.body.removeChild(tmp);
                        return { x: r.x, y: r.y, width: r.width, height: r.height };
                    } catch(e) {
                        return { x: 35.03, y: 42.15, width: 19.05, height: 57.06 };
                    }
                })();
                this.clefTemplate = clonePath;
                this.clefBBox = bb;
                this._abcStaffTopY = 30;
                this._abcStaffSpace = abcStaffSpace;
                this._abcClefBBoxLeft = bb.x;
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    layoutText(fontSize, fontFamily, maxWidth) {
        const ctx = this._measureCtx;
        ctx.font = `${fontSize}px ${fontFamily}`;
        const indent = '\u3000\u3000';
        const forbidden = /^[。，、；：！？,.!?;:\)\]》」』】）]+$/;
        const paragraphs = this.letterContent.value.replace(/\n{2,}/g, '\n').split('\n');
        const renderLines = [];

        paragraphs.forEach((para, pIdx) => {
            const prefixed = pIdx === 0 ? para : (indent + para);
            const chars = prefixed.split('');
            let current = '';
            for (let i = 0; i < chars.length; i++) {
                const ch = chars[i];
                const test = current + ch;
                const w = ctx.measureText(test).width;
                if (w > maxWidth && current !== '') {
                    if (forbidden.test(ch) && current.length > 1) {
                        const last = current.slice(-1);
                        const prev = current.slice(0, -1);
                        renderLines.push(prev);
                        current = last + ch;
                    } else {
                        renderLines.push(current);
                        current = ch;
                    }
                } else {
                    current = test;
                }
            }
            renderLines.push(current);
        });

        return renderLines;
    }

    _makeEl(name, attrs) {
        const el = document.createElementNS(SVG_NS, name);
        if (attrs) {
            for (const k in attrs) {
                if (attrs[k] !== null && attrs[k] !== undefined) {
                    el.setAttribute(k, attrs[k]);
                }
            }
        }
        return el;
    }

    _clearSvg() {
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
    }

    _ensureDefs() {
        let defs = this.svg.querySelector('defs');
        if (!defs) {
            defs = this._makeEl('defs');
            this.svg.insertBefore(defs, this.svg.firstChild);
        }
        return defs;
    }

    render() {
        const W = this.W;
        const H = this.H;
        const staffColor = this.staffColor.value;
        const textColor = this.textColor.value;
        const fontSize = parseInt(this.fontSize.value);
        const lineHeight = parseInt(this.lineHeight.value);
        const fontFamily = this.fontFamily.value;

        this._clearSvg();

        const textMarginLeft = 80;
        const textMarginRight = 60;
        const marginTop = 130;
        const staffPadding = 35;
        const staffLeft = staffPadding;
        const staffRight = W - staffPadding;
        const staffBlockHeight = lineHeight;
        const lineSpacingInStaff = staffBlockHeight / 10;
        const maxTextWidth = W - textMarginLeft - textMarginRight;

        this.drawPaperBackground();
        if (this.showBorder.checked) this.drawBorder();

        this.drawTitle(marginTop - 50, W, textColor, fontFamily, fontSize);

        const renderLines = this.layoutText(fontSize, fontFamily, maxTextWidth);

        renderLines.forEach((line, idx) => {
            const staffY = marginTop + idx * staffBlockHeight;

            this.drawSingleStaff(staffLeft, staffRight, staffY, lineSpacingInStaff, staffColor);

            if (this.showClef.checked) {
                this.drawTrebleClef(staffLeft + 5, staffY, lineSpacingInStaff, staffColor);
            }

            if (line.trim()) {
                this.drawSingleTextLineOnStaff(line, textMarginLeft, staffY,
                    lineSpacingInStaff, fontSize, textColor, fontFamily);
            }

            if (this.showNotes.checked && line.trim()) {
                this.drawDecorativeNotes(textMarginLeft, staffRight,
                    staffY, lineSpacingInStaff, idx);
            }
        });
    }

    drawPaperBackground() {
        const defs = this._ensureDefs();
        const gradId = 'paperGrad_' + Math.random().toString(36).slice(2, 8);
        const grad = this._makeEl('linearGradient', {
            id: gradId,
            x1: '0%', y1: '0%', x2: '100%', y2: '100%'
        });
        grad.appendChild(this._makeEl('stop', { offset: '0%', 'stop-color': '#fffef9' }));
        grad.appendChild(this._makeEl('stop', { offset: '100%', 'stop-color': '#fdf8f0' }));
        defs.appendChild(grad);

        const rect = this._makeEl('rect', {
            x: 0, y: 0, width: this.W, height: this.H,
            fill: `url(#${gradId})`
        });
        this.svg.appendChild(rect);

        const g = this._makeEl('g', { opacity: 0.03 });
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.W;
            const y = Math.random() * this.H;
            const r = Math.random() * 2;
            g.appendChild(this._makeEl('circle', {
                cx: x, cy: y, r: r, fill: '#c8b48c'
            }));
        }
        this.svg.appendChild(g);
    }

    drawBorder() {
        const W = this.W, H = this.H;
        const padding = 10;
        const innerPadding = 20;

        this.svg.appendChild(this._makeEl('rect', {
            x: padding,
            y: padding,
            width: W - padding * 2,
            height: H - padding * 2,
            fill: 'none',
            stroke: 'rgba(102, 126, 234, 0.6)',
            'stroke-width': 2
        }));

        this.svg.appendChild(this._makeEl('rect', {
            x: innerPadding,
            y: innerPadding,
            width: W - innerPadding * 2,
            height: H - innerPadding * 2,
            fill: 'none',
            stroke: 'rgba(102, 126, 234, 0.3)',
            'stroke-width': 1
        }));
    }

    drawTitle(y, W, color, fontFamily, fontSize) {
        const title = this.letterTitle.value || '无题';
        const titleSize = fontSize + 16;

        const titleEl = this._makeEl('text', {
            x: W / 2,
            y: y,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            'font-family': fontFamily,
            'font-size': titleSize,
            'font-weight': 'bold',
            fill: color
        });
        titleEl.textContent = title;
        this.svg.appendChild(titleEl);

        this._measureCtx.font = `bold ${titleSize}px ${fontFamily}`;
        const titleWidth = this._measureCtx.measureText(title).width;
        const lineWidth = Math.min(titleWidth + 60, W - 200);
        const lineY = y + 35;

        const d = `M ${W / 2 - lineWidth / 2} ${lineY} ` +
                  `Q ${W / 2 - lineWidth / 4} ${lineY + 7} ${W / 2} ${lineY} ` +
                  `Q ${W / 2 + lineWidth / 4} ${lineY - 7} ${W / 2 + lineWidth / 2} ${lineY}`;
        this.svg.appendChild(this._makeEl('path', {
            d: d,
            fill: 'none',
            stroke: 'rgba(102, 126, 234, 0.4)',
            'stroke-width': 1.5,
            'stroke-linecap': 'round'
        }));

        const deco = this._makeEl('text', {
            x: W / 2,
            y: y + 27,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            'font-family': 'serif',
            'font-size': fontSize - 2,
            fill: 'rgba(118, 75, 162, 0.5)'
        });
        deco.textContent = '♪ ♫ ♬ ♩ ♪';
        this.svg.appendChild(deco);
    }

    drawSingleStaff(left, right, y, spacing, color) {
        const g = this._makeEl('g', {
            stroke: color,
            'stroke-width': 1,
            'shape-rendering': 'crispEdges'
        });
        for (let i = 0; i < 5; i++) {
            const ly = y + i * spacing;
            g.appendChild(this._makeEl('line', {
                x1: left, y1: ly, x2: right, y2: ly
            }));
        }
        this.svg.appendChild(g);
    }

    drawTrebleClef(x, staffTopY, spacing, color) {
        if (!this.clefTemplate) {
            this._fallbackClef(x, staffTopY, spacing, color);
            return;
        }

        const scale = spacing / this._abcStaffSpace;
        const abcStaffTopY = this._abcStaffTopY;
        const abcClefLeft = this._abcClefBBoxLeft;

        const tx = x - abcClefLeft * scale;
        const ty = staffTopY - abcStaffTopY * scale;

        const g = this._makeEl('g', {
            transform: `translate(${tx}, ${ty}) scale(${scale})`
        });
        const path = this.clefTemplate.cloneNode(true);
        const origFill = path.getAttribute('fill');
        const origStroke = path.getAttribute('stroke');
        const origSW = path.getAttribute('stroke-width');

        if (origFill && origFill !== 'none' && (!origStroke || origStroke === 'none')) {
            path.setAttribute('fill', color);
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', origSW ? origSW : '0.7');
        } else if (origFill === 'none' || origFill == null) {
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', origSW ? origSW : '1.2');
        } else {
            path.setAttribute('fill', color);
            path.setAttribute('stroke', color);
            if (origSW) path.setAttribute('stroke-width', origSW);
        }
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        g.appendChild(path);
        this.svg.appendChild(g);

        const bb = this.clefBBox;
        const dotR = Math.max(1.8, spacing * 0.32) / scale;
        const L4 = abcStaffTopY + 4 * this._abcStaffSpace;
        const dotX = bb.x + bb.width * 0.38;
        const dotY = L4 + Math.max(2, spacing * 0.5) / scale;
        const dotG = this._makeEl('g', {
            transform: `translate(${tx}, ${ty}) scale(${scale})`
        });
        dotG.appendChild(this._makeEl('circle', {
            cx: dotX, cy: dotY, r: dotR, fill: color
        }));
        this.svg.appendChild(dotG);
    }

    _fallbackClef(x, staffTopY, spacing, color) {
        const s = spacing;
        const sx = x;
        const L0 = staffTopY;
        const L2 = staffTopY + s * 2;
        const L4 = staffTopY + s * 4;
        const strokeW = Math.max(1.6, s * 0.22);

        const d = `M ${sx + s * 0.9} ${staffTopY + s} ` +
            `C ${sx + s * 0.10} ${staffTopY + s - s * 0.45}, ${sx - s * 0.15} ${staffTopY + s - s * 1.05}, ${sx + s * 0.65} ${staffTopY + s - s * 1.55} ` +
            `C ${sx + s * 1.35} ${staffTopY + s - s * 2.00}, ${sx + s * 1.10} ${staffTopY + s - s * 2.80}, ${sx + s * 0.45} ${staffTopY + s - s * 2.55} ` +
            `C ${sx - s * 0.05} ${staffTopY + s - s * 2.35}, ${sx - s * 0.15} ${staffTopY + s - s * 1.75}, ${sx + s * 0.10} ${staffTopY + s - s * 1.15} ` +
            `C ${sx + s * 0.35} ${staffTopY + s - s * 0.55}, ${sx - s * 0.10} ${staffTopY + s + s * 0.15}, ${sx - s * 0.55} ${staffTopY + s + s * 0.85} ` +
            `C ${sx - s * 1.25} ${staffTopY + s + s * 1.85}, ${sx - s * 0.40} ${L4 + s * 0.30}, ${sx + s * 0.95} ${L4 - s * 0.10} ` +
            `C ${sx + s * 1.50} ${staffTopY + s * 3 + s * 0.65}, ${sx + s * 1.35} ${staffTopY + s * 3 + s * 0.05}, ${sx + s * 1.30} ${L2 + s * 0.70} ` +
            `C ${sx + s * 1.25} ${L2 + s * 0.10}, ${sx + s * 1.35} ${staffTopY + s + s * 0.40}, ${sx + s * 1.20} ${L0 - s * 0.20} ` +
            `C ${sx + s * 1.08} ${L0 - s * 0.75}, ${sx + s * 1.30} ${L0 - s * 1.35}, ${sx + s * 1.90} ${L0 - s * 1.15}`;

        this.svg.appendChild(this._makeEl('path', {
            d: d,
            fill: 'none',
            stroke: color,
            'stroke-width': strokeW,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
        }));

        this.svg.appendChild(this._makeEl('circle', {
            cx: sx + s * 0.82, cy: L4 + s * 0.5,
            r: Math.max(1.8, s * 0.32),
            fill: color
        }));
    }

    drawSingleTextLineOnStaff(text, x, staffTopY, lineSpacing, fontSize, color, fontFamily) {
        const centerLineY = staffTopY + lineSpacing * 2;
        this._measureCtx.font = `${fontSize}px ${fontFamily}`;

        let currentX = x;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const charWidth = this._measureCtx.measureText(ch).width;
            const wave = Math.sin((currentX + i * 3) * 0.015) * 0.8;
            const tilt = (Math.random() - 0.5) * 0.8;

            const t = this._makeEl('text', {
                x: currentX + charWidth / 2,
                y: centerLineY + wave,
                'text-anchor': 'middle',
                'dominant-baseline': 'middle',
                'font-family': fontFamily,
                'font-size': fontSize,
                fill: color,
                transform: `rotate(${tilt} ${currentX + charWidth / 2} ${centerLineY + wave})`
            });
            t.textContent = ch;
            this.svg.appendChild(t);
            currentX += charWidth;
        }
    }

    drawDecorativeNotes(left, right, y, spacing, seed) {
        const notePatterns = ['♪', '♫', '♬', '♩'];
        const noteColors = [
            'rgba(102, 126, 234, 0.35)',
            'rgba(118, 75, 162, 0.35)',
            'rgba(240, 147, 251, 0.35)',
            'rgba(245, 87, 108, 0.3)',
        ];

        const noteCount = 2 + Math.floor(Math.random() * 3);
        const positions = [];

        for (let i = 0; i < noteCount; i++) {
            let nx;
            let attempts = 0;
            do {
                nx = left + 20 + Math.random() * (right - left - 40);
                attempts++;
            } while (positions.some(p => Math.abs(p - nx) < 60) && attempts < 10);
            positions.push(nx);

            const noteIndex = (seed + i) % notePatterns.length;
            const colorIndex = Math.floor(Math.random() * noteColors.length);
            const lineOffset = Math.floor(Math.random() * 5);
            const ny = y + lineOffset * spacing;
            const size = 14 + Math.random() * 8;
            const wobble = Math.sin(seed * 0.5 + nx * 0.01) * 3;
            const rot = (Math.random() - 0.5) * 0.3 * 180 / Math.PI;

            const t = this._makeEl('text', {
                x: nx,
                y: ny + wobble,
                'text-anchor': 'middle',
                'dominant-baseline': 'middle',
                'font-family': 'serif',
                'font-size': size,
                fill: noteColors[colorIndex],
                opacity: 0.8,
                transform: `rotate(${rot} ${nx} ${ny + wobble})`
            });
            t.textContent = notePatterns[noteIndex];
            this.svg.appendChild(t);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StaffLetter();
});
