exports.up = function (knex) {
  return knex.schema.table("users", (tbl) => {
    tbl.string("department").notNullable().defaultTo("Yeetapartment");
  });
};

exports.down = function (knex) {
  return knex.schema.table("users", (tbl) => {
    tbl.dropColumn("department");
  });
};
