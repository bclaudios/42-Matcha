const cloudinary = require('../tools/Cloudinary')
const unsplash = require('./unsplash');
const Log = require('../tools/Log');

const SeedCloudinary = async () => {
    try {
        Log.log(`\n***** Cloudinary Seed *****`, `blue`);
        Log.log(`Cleaning "Seed" folders ...`);
        await cloudinary.api.delete_resources_by_prefix(`manSeed`)
        await cloudinary.api.delete_resources_by_prefix(`womanSeed`)
        Log.log(`"Seed" folder cleaned.`)
        const womanPics = unsplash.arrWoman;
        Log.log(`Uploading ${womanPics.length} woman pictures...`)
        for (i = 0; i < womanPics.length; i++) {
            await cloudinary.uploader.upload(womanPics[i], { public_id: `womanSeed/${i}`})
        }
        Log.log(`Woman pictures successfully uploaded.`, `green`);
        const manPics = unsplash.arrMan;
        Log.log(`Uploading ${manPics.length} man pictures...`)
        for (i = 0; i < manPics.length ; i++) {
            await cloudinary.uploader.upload(manPics[i], { public_id: `manSeed/${i}`})
        }
        Log.log(`Man pictures successfully uploaded.`, `green`);
        Log.log(`\nCloudinary seeding complete !`, `cyan`)
        process.exit(0);
    } catch (error) {
        Log.log(error, `red`);
        Log.log(`\nTerminating seeding process.`, `red`);
        process.exit(1);
    }
}

    SeedCloudinary();