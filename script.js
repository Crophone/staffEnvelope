class StaffLetter {
    constructor() {
        this.canvas = document.getElementById('staffCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.initElements();
        this.bindEvents();
        this.render();
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
        this.letterContent.value = `亲爱的朋友：
展信佳！
当你看到这封信的时候，
愿五线谱上的每一个字，
都化作美妙的音符，
轻轻飘进你的心里。
祝你每天都有好心情！
                                    此致
                                    敬礼
                                    你的朋友
                                    2026年9月`;
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
        const link = document.createElement('a');
        link.download = `五线谱信件_${this.letterTitle.value || '无题'}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    render() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const staffColor = this.staffColor.value;
        const textColor = this.textColor.value;
        const fontSize = parseInt(this.fontSize.value);
        const lineHeight = parseInt(this.lineHeight.value);
        const fontFamily = this.fontFamily.value;

        ctx.clearRect(0, 0, W, H);
        this.drawPaperBackground();
        if (this.showBorder.checked) this.drawBorder();

        const textMarginLeft = 80;
        const textMarginRight = 60;
        const marginTop = 130;
        const staffPadding = 35;
        const staffLeft = staffPadding;
        const staffRight = W - staffPadding;
        const staffBlockHeight = lineHeight;
        const lineSpacingInStaff = staffBlockHeight / 10;

        this.drawTitle(marginTop - 50, W, textColor, fontFamily, fontSize);

        const contentLines = this.letterContent.value.split('\n');

        
        contentLines.forEach((line, lineIndex) => {

            
            const staffY = marginTop + lineIndex * staffBlockHeight;

            this.drawSingleStaff(staffLeft, staffRight, staffY, lineSpacingInStaff, staffColor);

            if (this.showClef.checked) {
                this.drawTrebleClef(staffLeft + 5, staffY, lineSpacingInStaff, staffColor);
            }

            if (line.trim()) {
                this.drawTextLineOnStaff(line, textMarginLeft, staffY,
                    lineSpacingInStaff, W - textMarginLeft - textMarginRight,
                    fontSize, textColor, fontFamily);
            }

            if (this.showNotes.checked && line.trim()) {
                this.drawDecorativeNotes(textMarginLeft, staffRight,
                    staffY, lineSpacingInStaff, lineIndex);
            }
        });
    }

    drawSingleStaff(left, right, y, spacing, color) {
        const ctx = this.ctx;
        ctx.strokeStyle = color;
        ctx.globalAlpha = 1;
        for (let i = 0; i < 5; i++) {
            const lineY = y + i * spacing;
            ctx.beginPath();
            ctx.moveTo(left, lineY);
            ctx.lineTo(right, lineY);
            ctx.stroke();
        }
            // ctx.beginPath();
            // ctx.moveTo(left, y);
            // ctx.lineTo(left, y+4*spacing);
            // ctx.moveTo(right, y);
            // ctx.lineTo(right, y+4*spacing);
            // ctx.stroke();

    }

    // drawFullStaffBackground(left, right, top, bottom, blockHeight, lineSpacing, color) {
    //     const ctx = this.ctx;
    //     const H = this.canvas.height;
    //     const maxBottom = H - bottom;
    //     ctx.strokeStyle = color;
    //     ctx.globalAlpha = 1;

    //     let y = top;
    //     while (y + 4 * lineSpacing <= maxBottom) {
    //         for (let i = 0; i < 5; i++) {
    //             const lineY = y + i * lineSpacing;
    //             if (lineY > maxBottom) break;
    //             ctx.lineWidth = (i === 2) ? 2 : 1.4;
    //             ctx.beginPath();
    //             ctx.moveTo(left, lineY);
    //             ctx.lineTo(right, lineY);
    //             ctx.stroke();
    //         }
    //         y += blockHeight;
    //     }
    // }

    drawPaperBackground() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        const gradient = ctx.createLinearGradient(0, 0, W, H);
        gradient.addColorStop(0, '#fffef9');
        gradient.addColorStop(1, '#fdf8f0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(200, 180, 140, 0.03)';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;
            const r = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawBorder() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const padding = 30;
        const innerPadding = 40;

        ctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(padding, padding, W - padding * 2, H - padding * 2);

        ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(innerPadding, innerPadding, W - innerPadding * 2, H - innerPadding * 2);

        this.drawCornerOrnament(padding, padding, 1, 1);
        this.drawCornerOrnament(W - padding, padding, -1, 1);
        this.drawCornerOrnament(padding, H - padding, 1, -1);
        this.drawCornerOrnament(W - padding, H - padding, -1, -1);
    }

    drawCornerOrnament(x, y, dirX, dirY) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, dirY * 20);
        ctx.quadraticCurveTo(0, 0, dirX * 20, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, dirY * 12);
        ctx.quadraticCurveTo(dirX * 6, dirY * 6, dirX * 12, 0);
        ctx.stroke();
        ctx.fillStyle = 'rgba(118, 75, 162, 0.6)';
        ctx.beginPath();
        ctx.arc(dirX * 22, dirY * 22, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawTitle(y, W, color, fontFamily, fontSize) {
        const ctx = this.ctx;
        const title = this.letterTitle.value || '无题';

        ctx.save();
        ctx.font = `bold ${fontSize + 16}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, W / 2, y);

        ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
        ctx.lineWidth = 1.5;
        const titleWidth = ctx.measureText(title).width;
        const lineWidth = Math.min(titleWidth + 60, W - 200);
        ctx.beginPath();
        ctx.moveTo(W / 2 - lineWidth / 2, y + 35);
        ctx.quadraticCurveTo(W / 2 - lineWidth / 4, y + 42, W / 2, y + 35);
        ctx.quadraticCurveTo(W / 2 + lineWidth / 4, y + 28, W / 2 + lineWidth / 2, y + 35);
        ctx.stroke();

        ctx.fillStyle = 'rgba(118, 75, 162, 0.5)';
        ctx.font = `${fontSize - 2}px serif`;
        ctx.fillText('♪ ♫ ♬ ♩ ♪', W / 2, y + 55);

        ctx.restore();
    }

    drawStaffSystem(left, right, y, spacing, color) {
        const ctx = this.ctx;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(left, y + i * spacing);
            ctx.lineTo(right, y + i * spacing);
            ctx.stroke();
        }

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(left, y + 4 * spacing);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(right, y);
        ctx.lineTo(right, y + 4 * spacing);
        ctx.stroke();
    }

    drawTrebleClef(x, y, spacing, color) {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = Math.max(1.8, spacing * 0.28);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const L0 = y;
        const L1 = y + spacing;
        const L2 = y + spacing * 2;
        const L3 = y + spacing * 3;
        const L4 = y + spacing * 4;
        const sx = x;

        ctx.beginPath();
        ctx.moveTo(sx + spacing * 0.6, L2 - spacing * 0.2);
        ctx.bezierCurveTo(
            sx - spacing * 1.4, L2 - spacing * 1.1,
            sx - spacing * 0.6, L2 - spacing * 2.0,
            sx + spacing * 0.9, L2 - spacing * 1.15
        );
        ctx.bezierCurveTo(
            sx + spacing * 1.6, L2 - spacing * 0.65,
            sx + spacing * 0.9, L2 + spacing * 0.1,
            sx + spacing * 0.25, L2 + spacing * 0.6
        );
        ctx.bezierCurveTo(
            sx - spacing * 1.4, L2 + spacing * 1.9,
            sx - spacing * 0.6, L4 + spacing * 1.5,
            sx + spacing * 1.15, L4 + spacing * 0.25
        );
        ctx.bezierCurveTo(
            sx + spacing * 1.9, L3 + spacing * 0.85,
            sx + spacing * 1.35, L2 + spacing * 0.6,
            sx + spacing * 0.8, L1 - spacing * 0.25
        );
        ctx.bezierCurveTo(
            sx + spacing * 0.4, L0 - spacing * 0.9,
            sx + spacing * 1.1, L0 - spacing * 1.9,
            sx + spacing * 1.85, L0 - spacing * 1.45
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx + spacing * 0.95, L4 + spacing * 0.55, Math.max(1.6, spacing * 0.26), 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sx + spacing * 1.0, L3);
        ctx.lineTo(sx + spacing * 2.3, L3);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sx + spacing * 1.0, L4);
        ctx.lineTo(sx + spacing * 2.3, L4);
        ctx.stroke();

        ctx.restore();
    }

    drawTextLine(text, x, y, maxWidth, fontSize, color, fontFamily) {
        this.drawTextLineOnStaff(text, x, y - 50, 8, maxWidth, fontSize, color, fontFamily);
    }

    drawTextLineOnStaff(text, x, staffTopY, lineSpacing, maxWidth, fontSize, color, fontFamily) {
        const ctx = this.ctx;
        const centerLineY = staffTopY + lineSpacing * 2;

        ctx.save();
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'middle';

        const chars = text.split('');
        let currentX = x;
        let result = [];
        let currentLine = '';

        for (let char of chars) {
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== '') {
                result.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) result.push(currentLine);

        const drawSingleLine = (lineText, drawX, lineY) => {
            for (let i = 0; i < lineText.length; i++) {
                const char = lineText[i];
                const charWidth = ctx.measureText(char).width;
                const wave = Math.sin((drawX + i * 3) * 0.015) * 0.8;
                const tilt = (Math.random() - 0.5) * 0.8;

                ctx.save();
                ctx.translate(drawX + charWidth / 2, lineY + wave);
                ctx.rotate((tilt * Math.PI) / 180);
                ctx.textAlign = 'center';
                ctx.fillText(char, 0, 0);
                ctx.restore();

                drawX += charWidth;
            }
        };

        result.forEach((line, idx) => {
            drawSingleLine(line, currentX, centerLineY + idx * parseInt(this.lineHeight.value));
        });

        ctx.restore();
    }

    drawDecorativeNotes(left, right, y, spacing, seed) {
        const ctx = this.ctx;
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

            ctx.save();
            ctx.font = `${size}px serif`;
            ctx.fillStyle = noteColors[colorIndex];
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.8;

            const wobble = Math.sin(seed * 0.5 + nx * 0.01) * 3;
            ctx.translate(nx, ny + wobble);
            ctx.rotate((Math.random() - 0.5) * 0.3);
            ctx.fillText(notePatterns[noteIndex], 0, 0);
            ctx.restore();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StaffLetter();
});
