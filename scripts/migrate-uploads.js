import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migration script to move legacy product uploads to new structure
 * From: /public/uploads/product_[timestamp].[ext]
 * To: /public/uploads/products/[timestamp]_product.[ext]
 */

const uploadsDir = path.join(path.dirname(__dirname), 'public', 'uploads');
const productsDir = path.join(uploadsDir, 'products');

async function migrateProductUploads() {
    try {
        console.log('🔄 Starting product uploads migration...');

        // Ensure products directory exists
        if (!fs.existsSync(productsDir)) {
            fs.mkdirSync(productsDir, { recursive: true });
            console.log('✅ Created products directory');
        }

        // Read all files in uploads directory
        const files = fs.readdirSync(uploadsDir);

        // Filter legacy product files
        const productFiles = files.filter(file =>
            file.startsWith('product_') &&
            fs.statSync(path.join(uploadsDir, file)).isFile()
        );

        console.log(`📁 Found ${productFiles.length} legacy product files`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const file of productFiles) {
            try {
                const oldPath = path.join(uploadsDir, file);

                // Extract timestamp and extension from legacy filename
                // Format: product_1747931133287.png
                const match = file.match(/^product_(\d+)(\..+)$/);
                if (!match) {
                    console.log(`⚠️  Skipping invalid filename: ${file}`);
                    skippedCount++;
                    continue;
                }

                const [, timestamp, extension] = match;
                const newFilename = `${timestamp}_product${extension}`;
                const newPath = path.join(productsDir, newFilename);

                // Check if target file already exists
                if (fs.existsSync(newPath)) {
                    console.log(`⚠️  Target file already exists, skipping: ${newFilename}`);
                    skippedCount++;
                    continue;
                }

                // Move file
                fs.renameSync(oldPath, newPath);
                console.log(`✅ Migrated: ${file} → products/${newFilename}`);
                migratedCount++;

            } catch (error) {
                console.error(`❌ Error migrating ${file}:`, error.message);
                skippedCount++;
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`✅ Successfully migrated: ${migratedCount} files`);
        console.log(`⚠️  Skipped: ${skippedCount} files`);
        console.log(`📁 New location: /public/uploads/products/`);

        if (migratedCount > 0) {
            console.log('\n🔧 Next steps:');
            console.log('1. Update any database references from /uploads/product_* to /uploads/products/*');
            console.log('2. Test that existing product images still display correctly');
            console.log('3. Update any hardcoded URLs in your application');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration automatically
migrateProductUploads()
    .then(() => {
        console.log('\n🎉 Migration completed successfully!');
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
    });

export { migrateProductUploads };
