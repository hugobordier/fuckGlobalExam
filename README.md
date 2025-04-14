# globalexam

To install dependencies:

```bash
bun install
```

make a .env file in root of projet and set your credifentials inside like this : 
```bash
MAIL=""
PASSWORD=""
```

set here with your golablexamid :
```javascript
// Accès au planning
  await page.goto(
    "https://exam.global-exam.com/user-plannings/2251799877021366", // your id here 
    {
      waitUntil: "domcontentloaded",
    }
  );
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
