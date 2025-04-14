import { chromium, type Locator, type Page } from "playwright";
import dotenv from "dotenv";
dotenv.config();

const MAIL = process.env.MAIL as string;
const PASSWORD = process.env.PASSWORD as string;
const EXAM_URL = process.env.EXAM_URL;

const readingExercise = async (page: Page) => {
  while (true) {
    const correctionButton = page.getByRole("button", { name: "Correction" });

    if (await correctionButton.isVisible()) {
      console.log("🧠 Clique sur le bouton Correction !");
      await correctionButton.click();
    } else {
      console.log("❌ Bouton Correction non trouvé !");
    }

    // Attente de la bonne réponse visible
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

      console.log("REPONSELABELLE", answerLabels);

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
      console.log("❌ Aucune bonne réponse visible !");
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

    const terminerButton = page.getByRole("button", { name: "Terminer" });
    if (await terminerButton.isVisible()) {
      console.log(
        "✅ Bouton 'Terminer' trouvé, on clique dessus et on sort de la boucle."
      );
      await terminerButton.click();
      break; // Sort de la boucle while
    }

    await page.waitForTimeout(1500);
  }
};

(async () => {
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

  // Clique sur le bon module
  const gridContainer = page.locator(
    "div.grid.grid-cols-12.gap-x-4.gap-y-6.pt-5.pl-4.pb-8.ml-3.border-l-2"
  );
  const buttons: Locator[] = await gridContainer.locator("button").all();

  if (!buttons || buttons.length === 0) {
    console.log("Aucun bouton trouvé !");
    return;
  }

  let found = false;
  for (let i = 0; i < buttons.length - 1; i++) {
    const text = await buttons[i]?.innerText();
    console.log("---------------------------------------------------");
    console.log("Button text:", text);

    if (text && !text.includes("%") && !text.includes("Introduction")) {
      console.log("➡️  On clique sur :", text);
      await buttons[i]?.click();
      found = true;
      break;
    }
  }

  if (!found) {
    console.log(
      "✅ Tous les boutons ont un score ou aucun bouton cliquable trouvé !"
    );
    return;
  }

  console.log("ok aller 5seceonce");
  await page.waitForTimeout(5000);
  console.log("5seceonce finitio ");

  // Clique sur Démarrer
  const startButton = page.locator("button", { hasText: "Démarrer" }).first();
  if (await startButton.isVisible()) {
    console.log("🚀 Clique sur le bouton Démarrer !");
    await startButton.click();
  } else {
    console.log("❌ Bouton Démarrer non trouvé !");
  }

  await page.waitForTimeout(3000);

  // Boucle d'entraînement
  const pageContent = await page.content();

  console.log("Page content:", pageContent);

  if (pageContent.includes("Reading")) {
    console.log(
      "📖 La page contient le mot 'reading'. On commence l'exercice !"
    );
    await readingExercise(page); // Appel de la fonction readingExercise si "reading" est trouvé
  } else {
    console.log(
      "❌ La page ne contient pas le mot 'reading'. Test en cours..."
    );
    // Ajoute ton code de test ou autres vérifications ici
  }

  // Tu peux fermer le navigateur si besoin
  // await browser.close();
})();
