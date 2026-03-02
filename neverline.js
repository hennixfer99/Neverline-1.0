const { chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

async function fuckEveline(code, login, password) {
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

            for (const selector of selectors) {
                try {
                    const el = page.locator(selector).first();

                    if (await el.isVisible({ timeout })) {
                        await el.click();
                        await page.waitForTimeout(300);
                        return true;
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            return false;
        }
        async function checkIfVisible(timeout = 2000) {
            const selectors = [
                "xpath=/html/body/div/main/form/div[2]/div/div[2]/div[2]/button",
                "xpath=/html/body/div/main/form/div[2]/div/div[2]/div[3]/button",
                "xpath=/html/body/div/main/form/div[2]/div/div/div[3]/button",
                "xpath=/html/body/div/main/form/div[2]/div/div/div[2]/button",
            ].filter(Boolean);

            for (const selector of selectors) {
                try {
                    const el = page.locator(selector).first();

                    if (await el.isVisible({ timeout })) {
                        await el.click();
                        await page.waitForTimeout(300);
                        return true;
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            return false;
        }

        async function runFallbacks() {
            // jogo da memória
            try {
                if (
                    (
                        await page
                            .textContent(
                                "xpath=/html/body/div/main/form/div[1]/div[1]/h1",
                            )
                            .catch(() => "")
                    ).includes("Vocabulary Game")
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
            // 1️⃣ tentar clicar em um card
            try {
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
            } catch (err) {
                console.error("card fallback falhou:", err.message);
            }
            // 2️⃣ tentar clicar em uma option1
            try {
                const OPTION1_LABEL_1 =
                    "xpath=/html/body/div/main/form/div[2]/div/div[2]/div[1]/label[1]";
                const OPTION1_LABEL_4 =
                    "xpath=/html/body/div/main/form/div[2]/div/div[2]/div[1]/label[4]";
                const BTN =
                    "xpath=/html/body/div/main/form/div[2]/div/div[2]/div[2]/button";

                await page.click(OPTION1_LABEL_1, { timeout: 800 });
                await page.waitForTimeout(300);
                await page.click(BTN, { timeout: 1200 });
                await page.waitForTimeout(400);

                const btn = page.locator(BTN).first();
                let attempt = 0;

                while (await btn.isVisible().catch(() => false)) {
                    await page.reload({ waitUntil: "domcontentloaded" });
                    await page.waitForTimeout(400);

                    attempt++;
                    const useLabel4 = attempt % 4 === 0;
                    const labelSelector = useLabel4
                        ? OPTION1_LABEL_4
                        : OPTION1_LABEL_1;

                    await page.click(labelSelector, {
                        timeout: useLabel4 ? 300 : 800,
                    });
                    await page.waitForTimeout(300);
                    await page.click(BTN, { timeout: 1200 });
                    await page.waitForTimeout(400);
                }

                await clickIfVisible(NEXT_SELECTOR, 1200);
                return true;
            } catch (err) {
                console.error("option1 fallback falhou:", err.message);
            }
            // 2️⃣ tentar clicar em uma option/²
            try {
                await page.click(
                    "xpath=/html/body/div/main/form/div[2]/div/div[2]/div[2]/label[1]",
                    { timeout: 800 },
                );
                await page.waitForTimeout(400);
                const BTN =
                    "xpath=/html/body/div/main/form/div[2]/div/div[2]/div[3]/button";

                await page.click(BTN);
                await page.waitForTimeout(400);

                if (await page.locator(BTN).isVisible()) {
                    while (await page.locator(BTN).isVisible()) {
                        await page.reload();
                        await page.waitForTimeout(400);
                        await page.click(
                            "xpath=/html/body/div/main/form/div[2]/div/div[2]/div[2]/label[1]",
                        );
                        await page.waitForTimeout(400);
                        await page.click(BTN);
                        await page.waitForTimeout(400);
                    }
                }
                await clickIfVisible(NEXT_SELECTOR, 1200);
                return true;
            } catch (err) {
                console.error("option2 fallback falhou:", err.message);
            }
            // 3️⃣ clicar em listen + escrever "." + next
            try {
                await page.click(
                    "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/div[1]/div/div/div/button[1]",
                    {
                        timeout: 800,
                    },
                );
                await page.waitForTimeout(300);

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
                await page.waitForTimeout(300);

                const answer = await page.textContent(
                    "xpath=/html/body/div/div[3]/div",
                );

                let newAnswer = answer.replace(/[‘’]/g, "'");

                await page.waitForTimeout(300);

                await page.reload();

                await page.click(
                    "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/div[1]/div/div/div/button[1]",
                    {
                        timeout: 800,
                    },
                );
                await page.waitForTimeout(300);

                await page
                    .locator(
                        "xpath=/html/body/div[1]/main/form/div[2]/div/div[2]/div/div[3]/input",
                    )
                    .fill(newAnswer.trim(), { delay: 50 + Math.random() * 100 });

                await page.waitForTimeout(300);

                await page.click(
                    "xpath=/html/body/div/main/form/div[2]/div/div[2]/div/button",
                );

                await clickIfVisible(NEXT_SELECTOR, 1200);
                return true;
            } catch (err) {
                console.error("listen fallback falhou:", err.message);
            }
            //3.1 check's
            try {
                const instructions =
                    (await page.locator(".instructions").textContent()) || "";
                while (
                    instructions.includes("Choose the sentences") ||
                    instructions.includes("Select True or False.") ||
                    instructions.includes("Choose all")
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
                        console.log(i);
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
            //4 check final unit
            try {
                if (
                    (
                        await page.textContent(
                            "xpath=/html/body/div/main/form/div[1]/div[1]/h1",
                        )
                    ).includes("Learning Log")
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
            //5 cards de conteúdo
            try {
                while (
                    (await page.textContent(
                        "xpath=/html/body/div[1]/main/form/div[1]/div[1]/h1",
                    )) === "Review and Self-Evaluation — Vocabulary Flashcards"
                ) {
                    await page.click(
                        "xpath=/html/body/div[1]/main/form/div[2]/div/div/div[1]/div[1]/div[1]",
                    );
                    await page.waitForTimeout(500);

                    await page.click(
                        "xpath=/html/body/div[1]/main/form/div[2]/div/div/div[1]/div[1]/div[2]/button[1]",
                    );
                    await page.waitForTimeout(500);

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
                        return true;
                    }
                }

                await clickIfVisible(NEXT_SELECTOR, 1200);
                return true;
            } catch (err) {
                console.error("content cards fallback falhou:", err.message);
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
        });

        await card.first().waitFor({ state: "visible" });
        await card.first().locator("ul a").first().click();

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

// fuckEveline("nenhum", "Seu email", "Sua senha");

module.exports = { fuckEveline };
