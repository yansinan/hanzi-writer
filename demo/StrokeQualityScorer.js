
function scorePaths(standardD, userD, samples = 256, curveSubdiv = 24) {
  function samplePath(pathD, samples = 150,src="standard") {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    const length = path.getTotalLength();
    const pts = [];

    for (let i = 0; i < samples; i++) {
      const p = path.getPointAtLength((length * i) / (samples - 1));
      pts.push({ x: p.x, y: p.y });
    }

    return pts;
  }
  function smooth(points, window = 3) {
    const result = [];
    for (let i = 0; i < points.length; i++) {
      let sumX = 0;
      let sumY = 0;
      let count = 0;
      for (let j = -window; j <= window; j++) {
        const k = i + j;
        if (k >= 0 && k < points.length) {
          sumX += points[k].x;
          sumY += points[k].y;
          count++;
        }
      }
      result.push({
        x: sumX / count,
        y: sumY / count
      });  
    }
    return result;
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function dtw(A, B) {
    const n = A.length;
    const m = B.length;
    const dp = Array.from({ length: n + 1 }, () =>
      new Array(m + 1).fill(Infinity)
    );
    dp[0][0] = 0;
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = tolerantDistance(dist(A[i - 1], B[j - 1]), 50);
        dp[i][j] = cost + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[n][m] / (n + m);
  }
  function tolerantDistance(d, tolerance = 5) {
    if (d < tolerance) return 0;
    return d - tolerance;
  }

  function score(distance) {
    const k = 15;
    const s = 100 * Math.exp(-distance / k);
    // console.log("score", s, distance);
    return Math.max(0, Math.min(100, s));
  }

  // function pathSimilarity(pathA, pathB) {
    let A = samplePath(standardD, 100);//samples
    let B = samplePath(userD, 100);
    A = smooth(A, 2);
    B = smooth(B, 2);
    
    const d = dtw(A, B);
    // console.log("pathSimilarity3",d);
    return score(d);
  // }
}

/**
 * 颜色渐变函数 - HSL模式 (颜色过渡更自然)
 * @param {string} colorA - 起始颜色
 * @param {string} colorB - 结束颜色
 * @param {number} percent - 0-100 的百分比
 * @param {string} format - 返回格式: 'rgb' 或 'hex' 或 'hsl'
 */
function gradientHSL(colorA, colorB, percent, format = 'hex') {
    const t = Math.max(0, Math.min(100, percent)) / 100;
    
    // RGB 转 HSL
    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s * 100, l * 100];
    }
    
    // HSL 转 RGB
    function hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    // 解析颜色
    function parseColor(color) {
        let r, g, b;
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else if (color.startsWith('rgb')) {
            const matches = color.match(/\\d+/g);
            [r, g, b] = matches.map(Number);
        }
        return [r, g, b];
    }
    
    // 转换为HSL并插值
    const [r1, g1, b1] = parseColor(colorA);
    const [r2, g2, b2] = parseColor(colorB);
    
    let [h1, s1, l1] = rgbToHsl(r1, g1, b1);
    let [h2, s2, l2] = rgbToHsl(r2, g2, b2);
    
    // 处理色相环的短路径
    if (Math.abs(h2 - h1) > 180) {
        if (h2 > h1) {
            h1 += 360;
        } else {
            h2 += 360;
        }
    }
    
    // HSL插值
    const h = h1 + (h2 - h1) * t;
    const s = s1 + (s2 - s1) * t;
    const l = l1 + (l2 - l1) * t;
    
    // 转回RGB
    const [r, g, b] = hslToRgb(h % 360, s, l);
    
    // 根据格式返回
    if (format === 'hex') {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } else if (format === 'hsl') {
        return `hsl(${Math.round(h % 360)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    } else {
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// 使用示例
// console.log(gradientHSL('#ff0000', '#00ff00', 25));   // rgb(191, 64, 0)
// console.log(gradientHSL('#ff0000', '#00ff00', 50));   // rgb(128, 128, 0)
// console.log(gradientHSL('#ff0000', '#00ff00', 75));   // rgb(64, 191, 0)

// 导出模块（支持 CommonJS 和 ES6）

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {scorePaths,gradientHSL};
    module.exports.default = scorePaths; // 兼容 ES6 导入

} else if (typeof define === 'function' && define.amd) {
    define([], () => scorePaths);
} else {
    window.scorePaths = scorePaths;
    window.gradientHSL=gradientHSL;
}
export default scorePaths;