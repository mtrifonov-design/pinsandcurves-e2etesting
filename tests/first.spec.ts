import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Scan the ck_recordings folder for all JSON files
const recordingsDir = path.resolve(__dirname, '../ck_recordings');
const recordingFiles = fs.readdirSync(recordingsDir)
  .filter(file => file.endsWith('.json'));

for (const file of recordingFiles) {
  const filePath = path.join(recordingsDir, file);
  const jsonString = fs.readFileSync(filePath, 'utf-8');
  test.describe(`Recording: ${file}`, () => {
    test(`should load and play recording from ${file}`, async ({ page }) => {
      await page.goto('http://localhost:5173');
      // Inject and run the recording loader in the browser context
      await page.evaluate(async (json) => {
        // Wait for the global object to be available
        while (!window.CREATIVE_KERNEL_RECORDING) {
          await new Promise(r => setTimeout(r, 100));
        }
        // Load the recording
        window.CREATIVE_KERNEL_RECORDING.loadFromJson(json);
        // Find the first property that has a pushToPending method
        await new Promise<void>(resolve => {
          window.CREATIVE_KERNEL_RECORDING.pushToPending(() => {
            resolve();
          });
        });
      }, jsonString);
    });
  });
}
