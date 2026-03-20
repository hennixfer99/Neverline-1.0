const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

async function neverLine(code, login, password, siCurso) {
    let browser;
    try {
        browser = await chromium.launch({
            headless: false,
            args: [
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        });
        const context = await browser.newContext({
            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            viewport: { width: 1920, height: 1080 },
            locale: "pt-BR",
        });
        const page = await context.newPage();

        await page.goto("https://www.usalearns.org/student-sign-in", {
            waitUntil: "domcontentloaded",
            timeout: 900000,
        });
        await page.click("#EmailAddress");
        await page.type("#EmailAddress", login, {
            delay: 50 + Math.random() * 100,
        });

        await page.click("#Password");
        await page.type("#Password", password, {
            delay: 50 + Math.random() * 100,
        });

        await page.click(
            "xpath=/html/body/div[3]/div/div[1]/div/form/div[4]/input",
        );
        await page.waitForTimeout(1000);

        const NEXT_SELECTOR = "xpath=/html/body/div/div[4]/div/div[2]/button";

        const NEXT_SELECTOR2 =
            "xpath=/html/body/div[1]/div[4]/div/div[3]/button";
        const NEXT_SELECTOR3 = "#footerNavBtnNext";
        const NEXT_UNIT = "xpath=/html/body/div/main/div/div/a[1]";

        async function clickIfVisible(selector1, timeout = 2000) {
            const selectors = [
                selector1,
                NEXT_SELECTOR2,
                NEXT_SELECTOR3,
                NEXT_UNIT,
            ].filter(Boolean);

            try {
                if (
                    (
                        (await page
                            .textContent(
                                "xpath=/html/body/div/main/form/div[1]/div[1]/h1",
                            )
                            .catch(() => "")) || ""
                    ).includes("Write it!")
                ) {
                    await page
                        .locator("#textWritingArea")
                        .fill(". . . . . . . . . .");
                    await page.click("#doneButton");
                }
            } catch {}

            for (const selector of selectors) {
                try {
                    const el = page.locator(selector).first();

                    if (await el.isVisible({ timeout }).catch(() => false)) {
                        const enabled = await el.isEnabled().catch(() => true);
                        if (!enabled) continue;

                        try {
                            await el.click({ timeout, force: true });
                        } catch (err) {
                            try {
                                await page.evaluate((sel) => {
                                    const node = document.querySelector(sel);
                                    if (node) node.click();
                                }, selector);
                            } catch (err2) {
                                console.error(err2);
                                continue;
                            }
                        }

                        await page.waitForTimeout(300);
                        return true;
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            return false;
        }

        function phraseMaker(frase) {
            const palavrasOriginais = frase
                .replace(/[.,!?]/g, "")
                .split(/\s+/)
                .filter(Boolean);

            const palavras = [...palavrasOriginais];

            const conectores = [
                "because",
                "when",
                "if",
                "although",
                "since",
                "while",
            ];
            const auxiliares = ["is", "are", "was", "were", "am"];
            const pronomes = ["i", "you", "he", "she", "it", "we", "they"];
            const objetos = ["me", "you", "him", "her", "it", "us", "them"];
            const adjetivosComuns = [
                "bad",
                "sad",
                "happy",
                "angry",
                "upset",
                "tired",
                "worried",
                "confused",
                "nervous",
                "afraid",
                "sorry",
                "good",
                "fine",
            ];
            const verbosPrincipais = [
                "feel",
                "feels",
                "felt",
                "like",
                "likes",
                "liked",
                "want",
                "wants",
                "wanted",
                "need",
                "needs",
                "needed",
                "love",
                "loves",
                "loved",
                "hate",
                "hates",
                "hated",
                "think",
                "thinks",
                "thought",
            ];

            function retirar(condicao) {
                const index = palavras.findIndex(condicao);
                if (index === -1) return null;
                return palavras.splice(index, 1)[0];
            }

            function ehNomeProprio(p) {
                return /^[A-Z][a-z]+$/.test(p);
            }

            function ehVerboIng(p) {
                return /ing$/i.test(p);
            }

            // 1. tentar achar sujeito principal
            let sujeito =
                retirar((p) => ehNomeProprio(p)) ||
                retirar((p) => pronomes.includes(p.toLowerCase())) ||
                "";

            // 2. verbo principal
            let verboPrincipal =
                retirar((p) => verbosPrincipais.includes(p.toLowerCase())) ||
                "";

            // 3. complemento/adjetivo
            let complemento =
                retirar((p) => adjetivosComuns.includes(p.toLowerCase())) || "";

            // 4. conector
            let conector =
                retirar((p) => conectores.includes(p.toLowerCase())) || "";

            // 5. sujeito secundário
            let sujeito2 =
                retirar((p) => pronomes.includes(p.toLowerCase())) || "";

            // 6. auxiliar
            let auxiliar =
                retirar((p) => auxiliares.includes(p.toLowerCase())) || "";

            // 7. ação com ing
            let acao = retirar((p) => ehVerboIng(p)) || "";

            // 8. objeto
            let objeto =
                retirar((p) => objetos.includes(p.toLowerCase())) || "";

            const sobra = palavras.join(" ");

            let partes = [
                sujeito,
                verboPrincipal,
                complemento,
                conector,
                sujeito2,
                auxiliar,
                acao,
                objeto,
                sobra,
            ].filter(Boolean);

            let fraseFinal = partes.join(" ").trim();

            if (fraseFinal) {
                fraseFinal =
                    fraseFinal.charAt(0).toUpperCase() +
                    fraseFinal.slice(1) +
                    ".";
            }

            return fraseFinal || frase;
        }

        async function runFallbacks() {
            //jogo da memória
            try {
                if (
                    (
                        await page
                            .textContent(
                                "xpath=/html/body/div/main/form/div[1]/div[1]/h1",
                            )
                            .catch(() => "")
                    ).includes("Vocabulary Game") ||
                    (
                        await page
                            .textContent(
                                "xpath=/html/body/div/main/form/div[1]/div[1]/h1",
                            )
                            .catch(() => "")
                    ).includes("Concentration")
                ) {
                    let match = new Map();
                    let foundMatch = false;
                    let counter = 1;

                    for (let i = 1; i <= 12; ) {
                        // se i já foi pareado, pula pro próximo
                        if (match.has(i)) {
                            i++;
                            counter = 1;
                            continue;
                        }

                        const optionI = page.locator(
                            `xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div[1]/div[${i}]`,
                        );

                        // se i já está "resolvido" (opacity 0.3), pula
                        const opI0 = await optionI.evaluate(
                            (el) => getComputedStyle(el).opacity,
                        );
                        if (opI0 === "0.3") {
                            i++;
                            counter = 1;
                            continue;
                        }

                        // j = i + counter com wrap 1..12
                        let j = ((i - 1 + counter) % 12) + 1;
                        if (j === i) j = (j % 12) + 1; // só por segurança

                        // se j já foi pareado, tenta outro offset (sem avançar i)
                        if (match.has(j)) {
                            counter = (counter % 11) + 1; // 1..11
                            continue;
                        }

                        const optionJ = page.locator(
                            `xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div[1]/div[${j}]`,
                        );

                        // se j já está resolvido, tenta outro offset (sem avançar i)
                        const opJ0 = await optionJ.evaluate(
                            (el) => getComputedStyle(el).opacity,
                        );
                        if (opJ0 === "0.3") {
                            counter = (counter % 11) + 1;
                            continue;
                        }

                        await optionI.click();
                        await page.waitForTimeout(250);

                        await optionJ.click();
                        await page.waitForTimeout(350);

                        const opI = await optionI.evaluate(
                            (el) => getComputedStyle(el).opacity,
                        );
                        const opJ = await optionJ.evaluate(
                            (el) => getComputedStyle(el).opacity,
                        );

                        if (opI === "0.3" && opJ === "0.3") {
                            match.set(i, j);
                            match.set(j, i);
                            pass = true;

                            i++;
                            counter = 1;
                        } else {
                            counter = (counter % 11) + 1;
                        }
                    }
                }
            } catch (err) {
                console.error("memory game fallback falhou:", err.message);
            }
            //tentar clicar em um card
            try {
                const instructions =
                    (await page.locator(".instructions").textContent()) || "";
                if (instructions.includes("the correct picture")) {
                    const CARD_LABEL_1 =
                        "xpath=/html/body/div/main/form/div[2]/div/div[2]/label[1]";
                    const BTNcard =
                        "xpath=/html/body/div/main/form/div[2]/div/div[3]/button";

                    await page.click(CARD_LABEL_1, { timeout: 800 });
                    await page.waitForTimeout(300);
                    await page.click(BTNcard, { timeout: 1200 });
                    await page.waitForTimeout(400);

                    const btn = page.locator(BTNcard).first();

                    while (await btn.isVisible().catch(() => false)) {
                        await page.reload({ waitUntil: "domcontentloaded" });
                        await page.waitForTimeout(400);
                        await page.click(CARD_LABEL_1, { timeout: 800 });
                        await page.waitForTimeout(300);
                        await page.click(BTNcard, { timeout: 1200 });
                        await page.waitForTimeout(400);
                    }
                    await clickIfVisible(NEXT_SELECTOR, 1200);
                    return true;
                }
            } catch (err) {
                console.error("card fallback falhou:", err.message);
            }
            //tentar clicar em learn new words
            try {
                if (
                    (
                        await page
                            .textContent(
                                "xpath=/html/body/div/main/form/div[1]/div[1]/h1",
                            )
                            .catch(() => "")
                    ).includes("Learn New Words")
                ) {
                    await page.click(
                        "xpath=/html/body/div/main/form/div[3]/div/div/button[1]",
                    );
                    await page.waitForTimeout(300);

                    await page.click("#footerNavBtnNext");
                    return true;
                }
            } catch (err) {
                console.error("learn new words falhou:", err.message);
            }
            //check's
            try {
                const instructions =
                    (await page.locator(".instructions").textContent()) || "";
                while (
                    instructions.includes("Choose the sentences") ||
                    instructions.includes("Select True or False.") ||
                    instructions.includes("Choose all") ||
                    instructions.includes("Select all") ||
                    instructions.includes("Choose the correct")
                ) {
                    for (let i = 1; i < 10; i++) {
                        if (
                            await page
                                .locator(
                                    `xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div[1]/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                        ) {
                            await page
                                .locator(
                                    `xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div[1]/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                                .then(async (visible) => {
                                    if (visible) {
                                        const verify = page.locator(
                                            `xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div[1]/input[${i}]`,
                                        );

                                        const isCorrect =
                                            (await verify.getAttribute(
                                                "data-iscorrect",
                                            )) === "True";
                                        if (isCorrect) {
                                            await page.click(
                                                `xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div[1]/label[${i}]`,
                                            );
                                        }
                                    }
                                });
                        }
                        if (
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div/div[2]/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                        ) {
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div/div[2]/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                                .then(async (visible) => {
                                    if (visible) {
                                        const verify = page.locator(
                                            `xpath=/html/body/div/main/form/div[2]/div/div/div[2]/input[${i}]`,
                                        );

                                        const isCorrect =
                                            (await verify.getAttribute(
                                                "data-iscorrect",
                                            )) === "True";
                                        if (isCorrect) {
                                            await page.click(
                                                `xpath=/html/body/div/main/form/div[2]/div/div/div[2]/label[${i}]`,
                                            );
                                        }
                                    }
                                });
                        }
                        if (
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div/div[1]/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                        ) {
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div/div[1]/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                                .then(async (visible) => {
                                    if (visible) {
                                        const verify = page.locator(
                                            `xpath=/html/body/div/main/form/div[2]/div/div/div[1]/input[${i}]`,
                                        );

                                        const isCorrect =
                                            (await verify.getAttribute(
                                                "data-iscorrect",
                                            )) === "True";
                                        if (isCorrect) {
                                            await page.click(
                                                `xpath=/html/body/div/main/form/div[2]/div/div/div[1]/label[${i}]`,
                                            );
                                        }
                                    }
                                });

                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div/div[1]/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 });
                        }
                        if (i == 9) {
                            await page.click("#btnCheck");
                            await clickIfVisible(NEXT_SELECTOR, 1200);
                            return true;
                        }
                    }
                }
            } catch (err) {
                console.error("Erro na verificação de checks", err.message);
            }
            //clicar em listen + escrever "." + next
            try {
                let titulo = await page.textContent(
                    "xpath=/html/body/div/main/form/div[1]/div[1]/h1",
                );
                if (
                    titulo.includes("Dictation") ||
                    titulo.includes("Spell it") ||
                    titulo.includes("Spell Key")
                ) {
                    if (
                        await page
                            .locator(
                                "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/div[1]/div/div/div/button[1]",
                                {
                                    timeout: 800,
                                },
                            )
                            .isVisible()
                            .catch(() => false)
                    ) {
                        await page.click(
                            "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/div[1]/div/div/div/button[1]",
                            {
                                timeout: 800,
                            },
                        );
                        await page.waitForTimeout(300);
                    } else {
                        await page.click(
                            "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/div[1]/div/div/button[1]",
                            {
                                timeout: 800,
                            },
                        );
                        await page.waitForTimeout(300);
                    }

                    await page
                        .locator(
                            "xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div/div[3]/input",
                        )
                        .fill(".", { delay: 50 + Math.random() * 100 });

                    await page.waitForTimeout(300);

                    await page.click(
                        "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/button",
                    );
                    await page.waitForTimeout(300);

                    await page.click(
                        "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/button",
                    );
                    await page.waitForTimeout(2000);

                    const answer = await page.textContent(
                        "xpath=/html/body/div/div[3]/div",
                    );

                    // if(answer.includes("The correct")){
                    //     await page.waitForTimeout(300);
                    //     answer = await page.textContent(
                    //         "xpath=/html/body/div/div[3]/div",
                    //     );

                    //     console.log("outra answer", answer);
                    // }

                    let newAnswer = answer.replace(/[‘’]/g, "'");

                    if (newAnswer.includes("earth")) {
                        newAnswer = newAnswer.replace(/earth/gi, "Earth");
                    }

                    if (
                        newAnswer.includes("earthquake") ||
                        newAnswer.includes("Earthquake") ||
                        newAnswer.includes("earthquakes") ||
                        newAnswer.includes("Earthquakes")
                    ) {
                        newAnswer = newAnswer.replace(/earth/gi, "earth");
                    }
                    console.log(newAnswer);

                    await page.waitForTimeout(1000);

                    await page.reload();

                    if (
                        await page
                            .locator(
                                "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/div[1]/div/div/div/button[1]",
                                {
                                    timeout: 800,
                                },
                            )
                            .isVisible()
                            .catch(() => false)
                    ) {
                        await page.click(
                            "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/div[1]/div/div/div/button[1]",
                            {
                                timeout: 800,
                            },
                        );
                        await page.waitForTimeout(300);
                    } else {
                        await page.click(
                            "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/div[1]/div/div/button[1]",
                            {
                                timeout: 800,
                            },
                        );
                        await page.waitForTimeout(300);
                    }

                    await page
                        .locator(
                            "xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div/div[3]/input",
                        )
                        .fill(newAnswer.trim(), {
                            delay: 50 + Math.random() * 100,
                        });

                    await page.waitForTimeout(300);

                    await page.click(
                        "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/button",
                    );

                    await clickIfVisible(NEXT_SELECTOR, 1200);
                    return true;
                }
            } catch (err) {
                console.error("listen fallback falhou:", err.message);
            }
            //check final unit
            try {
                if (
                    (
                        await page
                            .textContent(
                                "xpath=/html/body/div/main/form/div[1]/div[1]/h1",
                            )
                            .catch(() => "")
                    ).includes("Learning Log")
                ) {
                    for (let i = 1; i < 20; i++) {
                        if (
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div/div/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                        ) {
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div/div/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                                .then(async (visible) => {
                                    if (visible) {
                                        await page.click(
                                            `xpath=/html/body/div/main/form/div[2]/div/div/div/label[${i}]`,
                                        );
                                        await page.waitForTimeout(300);
                                    }
                                });
                        }
                        if (i == 19) {
                            await page.click("#btn-Done");
                            await page.waitForTimeout(300);
                            await page.click(
                                "xpath=/html/body/div/main/div/div/a[2]",
                            );
                        }
                    }
                }
            } catch (err) {
                console.error("final unit fallback falhou:", err.message);
            }

            //check final unit
            try {
                if (
                    (
                        await page.textContent(
                            "xpath=/html/body/div/main/form/div[1]/div[1]/h1",
                        )
                    ).includes("Self-Assessment")
                ) {
                    for (let i = 1; i < 10; i++) {
                        await page
                            .locator(
                                `xpath=/html/body/div/main/form/div[2]/div/div/div/label[${i}]`,
                            )
                            .isVisible({ timeout: 800 })
                            .then(async (visible) => {
                                if (visible) {
                                    await page.click(
                                        `xpath=/html/body/div/main/form/div[2]/div/div/div/label[${i}]`,
                                    );
                                    await page.waitForTimeout(300);
                                } else {
                                    await page.click(
                                        "xpath=/html/body/div/main/form/div[2]/div/div/div/div/button",
                                    );
                                    await page.waitForTimeout(300);
                                    await page.click(
                                        "xpath=/html/body/div/main/div/div/a[2]",
                                    );
                                }
                            });
                    }
                }
            } catch (err) {
                console.error("final unit fallback falhou:", err.message);
            }
            //cards de conteúdo
            try {
                while (
                    (await page.textContent(
                        "xpath=/html/body/div[1]/main/form/div[1]/div[1]/h1",
                    )) === "Review and Self-Evaluation — Vocabulary Flashcards"
                ) {
                    if (
                        await page
                            .locator("#startButton")
                            .isVisible({ timeout: 800 })
                    ) {
                        await page.click("#startButton");
                    }

                    await page.click(
                        "xpath=/html/body/div[1]/main/form/div[2]/div/div/div[1]/div[1]/div[1]",
                    );

                    await page.waitForTimeout(1000);

                    try {
                        await page.click("#myButton1");

                        try {
                            await page
                                .locator("#myReviewButton")
                                .isVisible({ timeout: 800 })
                                .then(async (visible) => {
                                    if (visible) {
                                        await page.click("#myReviewButton");
                                    }
                                });
                            await page.waitForTimeout(1000);

                            await page.click("#footerNavBtnNext");
                            return true;
                        } catch (err) {}
                    } catch (err) {
                        await page.click(
                            "xpath=/html/body/div[1]/main/form/div[2]/div/div/div[1]/div[1]/div[1]",
                        );

                        await page.waitForTimeout(1000);
                        await page.click("#myButton1");
                        await page.waitForTimeout(1000);
                    }

                    await page.waitForTimeout(1000);
                    if (
                        await page
                            .locator(
                                "xpath=/html/body/div[1]/main/form/div[2]/div/div/div[1]/div[2]/button",
                            )
                            .isVisible({ timeout: 800 })
                    ) {
                        await page.click(
                            "xpath=/html/body/div[1]/main/form/div[2]/div/div/div[1]/div[2]/button",
                        );
                        await page.waitForTimeout(1000);
                        await page.click("#footerNavBtnNext");
                        return true;
                    }
                }
            } catch (err) {
                console.error("content cards fallback falhou:", err.message);
            }
            //type it
            try {
                if (
                    await page.locator("#btnTypeIt").isVisible({ timeout: 800 })
                ) {
                    await page.click("#btnTypeIt");
                    await page.waitForTimeout(300);
                    let answers = "";
                    for (let i = 1; i < 25; i++) {
                        if (
                            await page
                                .locator(
                                    `xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div/div[1]/div[1]/p[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                        ) {
                            answers +=
                                (await page
                                    .locator(
                                        `xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div/div[1]/div[1]/p[${i}]`,
                                    )
                                    .textContent()) + " ";
                        } else {
                            break;
                        }
                    }
                    answers = answers.trim();

                    await page.locator("#ko-input").fill(phraseMaker(answers));
                    await page.waitForTimeout(300);
                    await page.click("#btnCheck");
                    await page.waitForTimeout(300);
                    await clickIfVisible(NEXT_SELECTOR, 1200);
                    return true;
                }
            } catch (err) {
                console.error("type it fallback falhou:", err.message);
            }
            //option 4 ciclo
            try {
                let instructions = await page
                    .textContent(".instructions")
                    .catch(() => "");
                while (
                    instructions.toLowerCase().includes("word that matches")
                ) {
                    await page.click(
                        "xpath=/html/body/div/main/form/div[2]/div/div[2]/div[1]/label[1]",
                    );

                    await page.click("#btnCheck");
                    await page.waitForTimeout(400);

                    if (
                        (
                            await page.textContent(
                                "xpath=/html/body/div/div[3]/div",
                            )
                        )
                            .toLowerCase()
                            .includes("incorrect") ||
                        (
                            await page.textContent(
                                "xpath=/html/body/div/div[3]/div",
                            )
                        )
                            .toLowerCase()
                            .includes("correct answer above")
                    ) {
                        await page.reload();
                        await page.waitForTimeout(400);
                    } else {
                        await clickIfVisible(NEXT_SELECTOR, 1200);
                        return true;
                    }
                }
            } catch (err) {
                console.error("option2 fallback falhou:", err.message);
            }
            //tentar clicar em uma option1
            try {
                let instructions = await page
                    .textContent(".instructions")
                    .catch(() => "");
                console.log("Instruções:", instructions);
                if (
                    instructions.toLowerCase().includes("select the correct") ||
                    instructions.toLowerCase().includes("choose the answer") ||
                    instructions
                        .toLowerCase()
                        .includes("select the best way") ||
                    instructions.toLowerCase().includes("choose the words") ||
                    instructions
                        .toLowerCase()
                        .includes("answer the questions") ||
                    instructions.toLowerCase().includes("select the answer") ||
                    instructions.toLowerCase().includes("complete the") ||
                    instructions.toLowerCase().includes("select the verb") ||
                    instructions
                        .toLowerCase()
                        .includes("click the correct answer") ||
                    instructions.toLowerCase().includes("select listen") ||
                    instructions.toLowerCase().includes("review the verbs") ||
                    instructions
                        .toLowerCase()
                        .includes("select the missing word or words") ||
                    instructions
                        .toLowerCase()
                        .includes("choose the correct answer") ||
                    instructions
                        .toLocaleLowerCase()
                        .includes("choose the best") ||
                    instructions
                        .toLocaleLowerCase()
                        .includes("choose the missing word")
                ) {
                    for (let i = 0; i < 10; i++) {
                        if (
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div[2]/div[1]/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                        ) {
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div[2]/div[1]/label[${i}]`,
                                )

                                .isVisible({ timeout: 800 })
                                .then(async (visible) => {
                                    if (visible) {
                                        const verify = page.locator(
                                            `xpath=/html/body/div/main/form/div[2]/div/div[2]/div[1]/input[${i}]`,
                                        );

                                        const isCorrect =
                                            (await verify.getAttribute(
                                                "data-iscorrect",
                                            )) === "True";
                                        if (isCorrect) {
                                            await page.click(
                                                `xpath=/html/body/div/main/form/div[2]/div/div[2]/div[1]/label[${i}]`,
                                            );
                                        }
                                    }
                                });
                        } else if (
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div[2]/div[2]/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                        ) {
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div[2]/div[2]/label[${i}]`,
                                )

                                .isVisible({ timeout: 800 })
                                .then(async (visible) => {
                                    if (visible) {
                                        const verify = page.locator(
                                            `xpath=/html/body/div/main/form/div[2]/div/div[2]/div[2]/input[${i}]`,
                                        );

                                        const isCorrect =
                                            (await verify.getAttribute(
                                                "data-iscorrect",
                                            )) === "True";
                                        if (isCorrect) {
                                            await page.click(
                                                `xpath=/html/body/div/main/form/div[2]/div/div[2]/div[2]/label[${i}]`,
                                            );
                                        }
                                    }
                                });
                        } else if (
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div/div[2]/label[${i}]`,
                                )
                                .isVisible({ timeout: 800 })
                        ) {
                            await page
                                .locator(
                                    `xpath=/html/body/div/main/form/div[2]/div/div/div[2]/label[${i}]`,
                                )

                                .isVisible({ timeout: 800 })
                                .then(async (visible) => {
                                    if (visible) {
                                        const verify = page.locator(
                                            `xpath=/html/body/div/main/form/div[2]/div/div/div[2]/input[${i}]`,
                                        );

                                        const isCorrect =
                                            (await verify.getAttribute(
                                                "data-iscorrect",
                                            )) === "True";
                                        if (isCorrect) {
                                            await page.click(
                                                `xpath=/html/body/div/main/form/div[2]/div/div/div[2]/label[${i}]`,
                                            );
                                        }
                                    }
                                });
                        }
                        if (i == 9) {
                            (await page
                                .locator("#btnCheck")
                                .isVisible({ timeout: 800 })) &&
                                (await page.click("#btnCheck"));
                            await page.waitForTimeout(400);
                            await clickIfVisible(NEXT_SELECTOR, 1200);
                            return true;
                        }
                    }
                }
            } catch (err) {
                console.error("option1 fallback falhou:", err.message);
            }

            return false;
        }

        if (code !== "nenhum") {
            await page.click("xpath=/html/body/nav/div/ul/li[4]/a");
            await page.waitForTimeout(1000);

            await page
                .locator(
                    "xpath=/html/body/div[3]/div/div[1]/div/form/div[2]/input",
                )
                .fill(code, {
                    delay: 50 + Math.random() * 100,
                });
            await page.click(
                "xpath=/html/body/div[3]/div/div[1]/div/form/div[3]/input",
            );
            await page.waitForTimeout(1000);
            const card = page.locator("div.menuCourse").filter({
                hasText: /eveline.*cavalcante/i,
            });

            await card.first().waitFor({ state: "visible" });
            await card.first().locator("ul a").first().click();
            await page.click(
                "xpath=/html/body/div[3]/div[2]/div[1]/table/tbody/tr[1]/td[2]/a",
            );
            await page.waitForTimeout(1000);
            await page.click(
                "xpath=/html/body/div[3]/div[2]/div[1]/table/tbody/tr[1]/td[2]/a",
            );
            await page.waitForTimeout(1000);
            await page.click(
                "xpath=/html/body/div[3]/div[2]/div[1]/table/tbody/tr[2]/td[2]/a",
            );
            await page.waitForTimeout(1000);

            const MAX_STALL = 30;
            let stall = 0;

            for (;;) {
                const clickedNext = await clickIfVisible(NEXT_SELECTOR, 2000);
                await page.waitForTimeout(1000);

                if (clickedNext) {
                    stall = 0;
                    continue;
                }

                const progressed = await runFallbacks();

                if (progressed) {
                    stall = 0;
                    continue;
                }

                stall++;
                console.log(`Sem progresso (${stall}/${MAX_STALL})`);

                if (stall >= MAX_STALL) {
                    console.log("Finalizando loop - nenhuma ação restante.");
                    break;
                }

                await page.waitForTimeout(300);
            }
        }
        const card = page.locator("div.menuCourse").filter({
            hasText: /eveline.*cavalcante/i,
            has: page.locator("h2", { hasText: siCurso }),
        });

        await card.first().waitFor({ state: "visible" });
        await card.first().locator("ul a").first().click();

        try {
            await page.click(
                "xpath=/html/body/div[3]/div[2]/div[1]/table/tbody/tr[1]/td[2]/a",
            );
            await page.waitForTimeout(1000);
            await page.click(
                "xpath=/html/body/div[3]/div[2]/div[1]/table/tbody/tr[1]/td[2]/a",
            );
            await page.waitForTimeout(1000);
            await page.click(
                "xpath=/html/body/div[3]/div[2]/div[1]/table/tbody/tr[2]/td[2]/a",
            );
            await page.waitForTimeout(1000);
        } catch (err) {}

        const MAX_STALL = 30;
        let stall = 0;

        for (;;) {
            const clickedNext = await clickIfVisible(NEXT_SELECTOR, 2000);
            await page.waitForTimeout(1000);

            if (clickedNext) {
                stall = 0;
                continue;
            }

            const progressed = await runFallbacks();

            if (progressed) {
                stall = 0;
                continue;
            }

            stall++;
            console.log(`Sem progresso (${stall}/${MAX_STALL})`);

            if (stall >= MAX_STALL) {
                console.log("Finalizando loop - nenhuma ação restante.");
                break;
            }

            await page.waitForTimeout(300);
        }
    } catch (error) {
        console.error("Scraping error:", error.message);
        console.error("Full error:", error);
        if (browser) {
            await browser.close();
        }
        throw error;
    }
}

// neverLine
//("nenhum", "Seu email", "Sua senha", "seu curso (ex: SI3)");

module.exports = { neverLine };
