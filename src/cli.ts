import chalk from 'chalk';
import execa from 'execa';
import { BinaryManager } from './utils/binary-manager';
// Import version directly from package.json at build time
import { version } from '../package.json';

/**
 * Passthrough CLI - delegates all commands to capiscio-core binary.
 * 
 * This wrapper manages the download and execution of the platform-specific
 * capiscio-core binary, passing all arguments through transparently.
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle wrapper-specific maintenance commands
  if (args.length > 0) {
    if (args[0] === '--wrapper-version') {
      console.log(`capiscio-node wrapper v${version}`);
      process.exit(0);
    }

    if (args[0] === '--wrapper-clean') {
      const fs = await import('fs');
      const os = await import('os');
      const path = await import('path');
      
      const cacheDir = path.join(os.homedir(), '.capiscio', 'bin');
      try {
        if (fs.existsSync(cacheDir)) {
          fs.rmSync(cacheDir, { recursive: true, force: true });
          console.log(chalk.green(`Cleaned cache directory: ${cacheDir}`));
        } else {
          console.log(chalk.yellow('Cache directory does not exist.'));
        }
        process.exit(0);
      } catch (error) {
        console.error(chalk.red(`Failed to clean cache: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    }
  }

  // Delegate everything to the core binary
  try {
    const binaryManager = BinaryManager.getInstance();
    const binaryPath = await binaryManager.getBinaryPath();

    // Execute binary with all args passed through
    // We inherit stdio so the binary's output goes directly to the user's terminal
    const subprocess = execa(binaryPath, args, {
      stdio: 'inherit',
      reject: false // Don't throw on non-zero exit code, we handle it manually
    });

    const result = await subprocess;
    process.exit(result.exitCode);

  } catch (error) {
    console.error(chalk.red(`❌ Error executing CapiscIO Core: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}

// Global error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Unexpected error:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('❌ Unhandled rejection:'), reason);
  process.exit(1);
});

main();