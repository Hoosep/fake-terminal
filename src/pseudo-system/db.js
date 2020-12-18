import Dexie from 'dexie';
import { autobind } from 'core-decorators';
import { STORAGE_KEY, DIR, FILE } from './consts';

function defineDB(pathSeporator) {
  const db = new Dexie(STORAGE_KEY);

  db.version(1).stores({
    folders: '++id,&[id+path],folderId,fullPath',
    files: '++id,&[folderId+filename],filename,extension,folderId,fullPath',
    superBlock: '++id,blockSize,blocksTotal,fileSysSize,inodeListSize,freeBlocks,freeInodes',
    inodesList: '++id,type,owner,dateTime,size'
  });


  @autobind
  class SuperBlock {
    constructor(
      blockSize = 1024, blocksTotal = 1024,
      fileSysSize = 1024 * 1024, inodeListSize = 8192,
      freeBlocks = 1024 - 12, freeInodes = 8192) {
      this.blockSize = blockSize;
      this.blocksTotal = blocksTotal;
      this.fileSysSize = fileSysSize;
      this.inodeListSize = inodeListSize;
      this.freeBlocks = freeBlocks;
      this.freeInodes = freeInodes;
    }

    save() {
      return db.superBlock.put(this);
    }
  }

  @autobind
  class InodesList {
    constructor(
      type,
      owner='user',
      dateTime=new Date(),
      size=64
    )
       {
      this.type = type;
      this.owner = owner;
      this.dateTime = dateTime;
      this.size = size;
    }

    save() {
      return db.inodesList.put(this);
    }
  }

  @autobind
  class Folder {
    constructor(path, parentFolder = { fullPath: '' }, base = false, inodeID=0) {
      this.path = path;
      this.fullPath = parentFolder.fullPath + path + pathSeporator;
      this.folderId = parentFolder.id;
      this.type = DIR;
      this.isBase = base;
      this.inodeID = inodeID;
    }

    save() {
      return db.folders.put(this);
    }
  }

  @autobind
  class File {
    constructor(filename, extention, parentFolder, contents = '',inodeID=0) {
      this.fullPath = `${parentFolder.fullPath + filename}.${extention}`;
      this.filename = filename;
      this.extention = extention;
      this.folderId = parentFolder.id;
      this.content = contents;
      this.type = FILE;
      this.inodeID = inodeID;
    }

    setContents(contents = '') {
      this.content = contents;
      this.save();
    }

    getFullName() {
      return (this.filename || '') + (this.extention ? '.' : '') + (this.extention || '');
    }

    save() {
      return db.files.put(this);
    }
  }

  db.folders.mapToClass(Folder);
  db.files.mapToClass(File);
  db.superBlock.mapToClass(SuperBlock);
  db.inodesList.mapToClass(InodesList);

  return [db, Folder, File, SuperBlock, InodesList];
}

export default function(pathSeporator, clear) {
  if (clear) {
    Dexie.delete(STORAGE_KEY);
  }
  const [db, Folder, File, SuperBlock, InodesList] = defineDB(pathSeporator);
  db.superBlock.count(async count => {
    if(count === 0){
      let id = await db.superBlock.add(new SuperBlock());
      if(id) {
        
        let inodeID = await db.inodesList.add(new InodesList(DIR));
        if(inodeID) {
          await db.folders.add(new Folder('', { fullPath: '' }, true, inodeID));
          inodeID = 0;
        }
        
        db.folders.toCollection().first().then(async item => {
          let inodeID = await db.inodesList.add(new InodesList(DIR));
          if(inodeID) {
            await db.folders.add(new Folder('home', item, false, inodeID));
            inodeID = 0;
          }
          inodeID = await db.inodesList.add(new InodesList(DIR));
          if(inodeID){
            await db.folders.add(new Folder('user', { fullPath: `${item.fullPath}home${pathSeporator}`, id: item.id + 1 }, false, inodeID)).then(folder => {
              let offsetblockSize = (folder * 1024) + (16 * 3); //Cause we initialized three dirs.
              let offsetFreeInodes = 8192 - (8 * 3);
              db.superBlock.update(1, {
                blockSize: offsetblockSize,
                freeInodes: offsetFreeInodes
              });
            });
          }
        });
      }
    }
  });

  return [db, Folder, File, SuperBlock, InodesList];
}
