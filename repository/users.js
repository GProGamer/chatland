const fs = require("fs");
const crypto = require("crypto");
const util = require("util");

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
  constructor(datafile) {
    if (!datafile) throw new Error(`There is not file`);
    this.datafile = datafile;

    try {
      fs.accessSync(this.datafile);
    } catch (err) {
      fs.writeFileSync(this.datafile, "[]");
    }
  }

  async obtenerTodo() {
    return JSON.parse(
      await fs.promises.readFile(this.datafile, {
        encoding: "utf8",
      })
    );
  }

  async crearUsuario(attrs) {
    attrs.id = this.randomId();

    const salt = crypto.randomBytes(8).toString("hex");

    const buff = await scrypt(attrs.password, salt, 64);

    const record = {
      ...attrs,
      password: `${buff.toString("hex")}?${salt}`,
    };

    const records = await this.obtenerTodo();
    records.push(record);
    await this.writeAll(records);

    return record;
  }

  async compararContraseñas(saved, supplied) {
    const [hashed, salt] = saved.split("?");
    const buff = await scrypt(supplied, salt, 64);
    return hashed === buff.toString("hex");
  }

  async writeAll(records) {
    await fs.promises.writeFile(
      this.datafile,
      JSON.stringify(records, null, 2)
    );
  }

  async getOne(id) {
    const records = await this.obtenerTodo();
    return records.find((record) => {
      return record.id === id;
    });
  }

  async delete(id) {
    const records = await this.obtenerTodo();
    const newRecords = records.filter((record) => {
      return record.id !== id;
    });
    await this.writeAll(newRecords);
    console.log(newRecords);
  }

  async update(id, attrs) {
    const records = await this.obtenerTodo();
    const record = records.find((record) => {
      return record.id === id;
    });

    if (!record) throw new Error(`Could not find id ${id}`);

    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.obtenerTodo();

    for (let record of records) {
      let found = false;

      for (let property in filters) {
        if (filters[property] === record[property]) {
          found = true;
        } else {
          found = false;
        }
      }

      if (found) {
        return record;
      }
    }
  }

  randomId() {
    return crypto.randomBytes(4).toString("hex");
  }
}

module.exports = new UsersRepository("users.json");
