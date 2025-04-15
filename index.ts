import { chromium, type Locator, type Page } from "playwright";
import dotenv from "dotenv";
dotenv.config();

const MAIL = process.env.MAIL as string;
const PASSWORD = process.env.PASSWORD as string;

const readingExercise = async (page: Page) => {
  while (true) {
    // Récupère tous les boutons "Correction" visibles
    const correctionButtons = await page
      .getByRole("button", { name: "Correction" })
      .all();

    let correctionFound = false;

    for (const [index, correctionButton] of correctionButtons.entries()) {
      if (await correctionButton.isVisible()) {
        console.log(`🧠 Correction ${index + 1} trouvée, on clique !`);
        await correctionButton.click();
        correctionFound = true;
        await page.waitForTimeout(500); // petite pause pour laisser apparaître les labels
      } else {
        console.log(`❌ Correction ${index + 1} pas visible`);
      }
    }

    if (!correctionFound) {
      console.log("❌ Aucun bouton Correction visible !");
    }

    // Attente d'une bonne réponse visible
    const successLabel = page.locator("label.bg-success-05").last();
    console.log("Attente de la bonne réponse visible...");
    try {
      await successLabel.waitFor({ state: "visible", timeout: 10000 });

      const answerLabels = await page.locator("div.flex.flex-col label").all();

      for (const [index, label] of answerLabels.entries()) {
        const className = await label.getAttribute("class");
        const labelText = await label.innerText();
        console.log(
          `Label ${index + 1}: Class - ${className}, Text - ${labelText}`
        );
      }

      // Clique sur la bonne réponse visible
      const successLabels = await page.locator("label.bg-success-05").all();
      if (successLabels.length > 0) {
        const newSuccessLabel = successLabels[successLabels.length - 1];
        const answerText = await newSuccessLabel?.innerText();
        console.log("✅ Bonne réponse trouvée ! On clique sur :", answerText);
        await newSuccessLabel?.click();
      } else {
        console.log("❌ Aucune bonne réponse visible !");
      }
    } catch {
      console.log("❌ Aucune bonne réponse visible (timeout) !");
    }

    // Clique sur Suivant ou Valider
    const suivantButton = page.getByRole("button", { name: "Suivant" });
    const validerButton = page.getByRole("button", { name: "Valider" });

    if (await suivantButton.isVisible()) {
      console.log("➡️ Clique sur le bouton Suivant !");
      await suivantButton.click();
    } else if (await validerButton.isVisible()) {
      console.log("📝 Clique sur le bouton Valider !");
      await validerButton.click();
    } else {
      console.log("❌ Aucun bouton 'Suivant' ou 'Valider' trouvé !");
    }

    // Fin de l'exercice
    const terminerButton = page.getByRole("button", { name: "Terminer" });
    if (await terminerButton.isVisible()) {
      console.log(
        "✅ Bouton 'Terminer' trouvé, on clique dessus et on sort de la boucle."
      );
      await terminerButton.click();
      break;
    }

    await page.waitForTimeout(1500);
  }
};

const listeningExercise = async (page: Page) => {
  while (true) {
    const divWithClass = page.locator(
      "div.w-full.relative.lg\\:block.lg\\:w-7\\/10"
    );

    if (await divWithClass.isVisible()) {
      console.log("✅ La div est visible !");

      const cardDivs = divWithClass.locator("div.card");
      const count = await cardDivs.count();
      console.log(
        `Il y a ${count} div(s) avec la classe 'card' à l'intérieur.`
      );

      for (let i = 0; i < count; i++) {
        const cardDiv = cardDivs.nth(i);
        const textContent = await cardDiv.textContent();
        console.log(`🃏 Texte de la div card ${i}: ${textContent}`);

        // Étape 1 : Clique sur "Voir la correction"
        const correctionButton = cardDiv.locator("text=Voir la correction");
        if (await correctionButton.isVisible()) {
          console.log(
            `➡️ Bouton correction trouvé pour la carte ${i}, on clique`
          );
          await correctionButton.click();
          await page.waitForTimeout(500); // petite pause si l'affichage est animé
        } else {
          console.log(`❌ Bouton correction non trouvé dans la carte ${i}`);
        }

        // Étape 2 : Clique sur le label avec la bonne réponse (bg-success-05)
        const correctLabel = cardDiv.locator("label.bg-success-05");
        if (await correctLabel.isVisible()) {
          console.log(`✅ Label correct trouvé dans la carte ${i}, on clique`);
          await correctLabel.click();
        } else {
          console.log(
            `❌ Label avec bg-success-05 pas trouvé dans la carte ${i}`
          );
        }
      }

      // Étape finale : Clique sur le bouton "Valider"
      const validerButton = page.locator('button:has-text("Valider")');
      if (await validerButton.isVisible()) {
        console.log("🚀 Bouton 'Valider' trouvé, on valide tout !");
        await validerButton.click();
      } else {
        console.log("❌ Bouton 'Valider' pas trouvé sur la page.");
      }

      const terminerButton = page.getByRole("button", { name: "Terminer" });
      if (await terminerButton.isVisible()) {
        console.log(
          "✅ Bouton 'Terminer' trouvé, on clique dessus et on sort de la boucle."
        );
        await terminerButton.click();
        break; // Sort de la boucle while
      }
    } else {
      console.log("❌ La div principale n'est pas visible.");
    }
  }
};

const main = async () => {
  try {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Connexion
    await page.goto("https://exam.global-exam.com/");
    await page.waitForTimeout(1000);
    await page.fill('input[name="email"]', MAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Accès au planning
    await page.goto(
      "https://exam.global-exam.com/user-plannings/2251799877021366",
      {
        waitUntil: "domcontentloaded",
      }
    );
    await page.waitForTimeout(2000);

    while (true) {
      const test = page.locator("button", { hasText: "Démarrer" }).first();
      if (await test.isVisible()) {
        console.log("🚀 Clique sur le bouton Démarrer !");
        await test.click();
      } else {
        console.log("❌ Bouton Démarrer non trouvé !");
      }

      const gridContainer = page.locator(
        "div.grid.grid-cols-12.gap-x-4.gap-y-6.pt-5.pl-4.pb-8.ml-3.border-l-2"
      );
      const buttons: Locator[] = await gridContainer.locator("button").all();

      if (!buttons || buttons.length === 0) {
        console.log("❌ Aucun bouton trouvé !");
        break;
      }

      let found = false;
      for (let i = 0; i < buttons.length - 1; i++) {
        const text = await buttons[i]?.innerText();
        console.log("---------------------------------------------------");
        console.log("Button text:", text);

        if (
          text &&
          !text.includes("%") &&
          !text.includes("Introduction") &&
          text.includes("Partie")
        ) {
          console.log("➡️  On clique sur :", text);
          await buttons[i]?.click();
          found = true;
          break;
        }
      }

      if (!found) {
        console.log("✅ Tous les modules sont faits !");
        break;
      }

      await page.waitForTimeout(5000);

      const startButton = page
        .locator("button", { hasText: "Démarrer" })
        .first();
      if (await startButton.isVisible()) {
        console.log("🚀 Clique sur le bouton Démarrer !");
        await startButton.click();
      } else {
        console.log("❌ Bouton Démarrer non trouvé !");
      }

      await page.waitForTimeout(3000);

      const divWithClass = page.locator(
        "div.hidden.items-center.pr-2.lg\\:flex"
      );
      const divContent = await divWithClass.textContent();

      if (divContent && divContent.includes("reading")) {
        console.log("📖 Exercice de reading détecté !");
        await readingExercise(page);
      } else if (divContent && divContent.includes("listening")) {
        console.log("🎧 Exercice de listening détecté !");
        await listeningExercise(page);
      } else {
        console.log("❓ Type d'exercice non reconnu !");
      }

      await page.waitForTimeout(3000);

      const nextButton = page
        .locator("button", { hasText: "aaActivité suivante" })
        .first();

      if (await nextButton.isVisible().catch(() => false)) {
        console.log("➡️ Clique sur 'Activité suivante' !");
        await nextButton.click();
        await page.waitForTimeout(3000);
      } else {
        console.log(
          "🔁 Bouton 'Activité suivante' non trouvé, retour manuel au planning !"
        );
        await page.goto(
          "https://exam.global-exam.com/user-plannings/2251799877021366",
          {
            waitUntil: "domcontentloaded",
          }
        );
        await page.waitForTimeout(2000);
      }

      await page.waitForTimeout(3000);
    }

    console.log("🏁 Tous les exercices sont terminés !");
    await browser.close();

    // 🔁 On redémarre la fonction (infinite loop style)
    console.log("♻️ Redémarrage automatique du script !");
    await main();
  } catch (error) {
    console.error("💥 Une erreur est survenue :", error);
    console.log("🔁 Tentative de relancement du script !");
    await main(); // 🔁 on redémarre même en cas d'erreur
  }
};

// Let's go 🚀
main();
