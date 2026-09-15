# MA Playground

**Multivariable Calculus Visual Lab — let intuition stand up to proof.**

[中文](README.md) · [Mathematical notes](docs/MATHEMATICS.md) · [Verification](docs/VERIFICATION.md)

MA Playground is a dependency-free, browser-based learning notebook for undergraduate multivariable calculus. Each experiment connects an interactive observation to exact substitutions, rigorous definitions, a proof, and short diagnostic questions. The current teaching interface is in Chinese.

## Two complete experiments

**The path trap.** Explore $F(x,y)=x^2y/(x^4+y^2)$ away from the origin, extended by $F(0,0)=0$. Every fixed line has limit zero, but the parabolas $y=cx^2$ have limits $c/(1+c^2)$. Compare paths, approach from either parameter sign, and inspect a sequential or epsilon–delta contradiction.

**Beyond partial derivatives.** Compare $f(x,y)=x^2+y^2$ and $g(x,y)=xy/\sqrt{x^2+y^2}$, with $g(0,0)=0$. Both partial derivatives at the origin vanish. However, only the first function has a remainder that is uniformly little-o of displacement. Switch between absolute and normalized error, rotate the direction, and inspect the analytic worst-direction error.

Finite samples are never presented as a proof. Candidate planes are not mislabeled as tangent planes. The one-sided radial exploration is distinguished from two-sided directional derivatives.

## Run

Node.js 22+ is sufficient; there are no npm dependencies.

```bash
npm run dev
npm run verify
npm run preview
```

`npm run build` produces both an ES-module static site and `dist/standalone.html`, a self-contained offline version that can be opened directly. No external scripts, fonts, API keys, or services are required.

For real browser regression tests:

```bash
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
npm run build
npm run test:ui
```

The normal test mode exercises the served ES-module site under `/MA_playground/`. The explicitly named offline harness injects the generated standalone version without changing browser policies; its narrower coverage is documented rather than equated with a deployed-site test.

## Deploy

The GitHub Actions workflow validates the site and deploys `main` to GitHub Pages once the repository's Pages source is set to **GitHub Actions**. The intended URL is `https://xby474-dev.github.io/MA_playground/`; see [delivery status](docs/STATUS.md) for whether publication actually happened.

The UI supports parameterized share links, CSV exports, native MathML, pointer and keyboard-controlled diagrams, mobile layouts, reduced-motion preferences, and proof-page printing. Screenshots in the Chinese README are captured from the actual application, not mockups.

MIT-licensed. No analytics. No third-party font files included.
