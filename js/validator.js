/**
 * Copyright (C) 2013 Yurij Mikhalevich
 * @license GPLv3
 * @author Yurij Mikhalevich <0@39.yt>
 */

var Validator = {
  types: {}
};

Validator.types.Integer = function (minimum, maximum, required) {
  var integer = { type: 'integer' };
  if (minimum) {
    integer.minimum = minimum;
  }
  if (maximum) {
    integer.maximum = maximum;
  }
  if (required) {
    integer.required = true;
  }
  return integer;
};
Validator.types.Serial = new Validator.types.Integer(1);
Validator.types.Timestamp = { type: 'string', format: 'date-time' };
Validator.types.Text = { type: 'string' };
Validator.types.String = function (length, required) {
  return { type: 'string', maxLength: length, required: required || false };
};
Validator.types.Boolean = { type: 'boolean' };
Validator.types.Email = { type: 'string', format: 'email', maxLength: 255 };
Validator.types.Phone = { type: 'string', pattern: /^\+[0-9]{10,15}$/ };
Validator.types.Enum = function (values, required) {
  return { type: 'string', enum: values, required: required || false };
};
Validator.types.UserRole = new Validator.types.Enum([ 'client', 'helper', 'subdepartment chief', 'department chief' ]);
Validator.types.OrderingDirection = new Validator.types.Enum([ 'ASC', 'DESC' ]);
Validator.types.SerialFilter = {
  type: [ 'integer', 'array', 'null' ],
  minimum: 1,
  minLength: 1,
  items: new Validator.types.Integer(1)
};
Validator.types.StringFilter = function (length, required) {
  return {
    type: [ 'string', 'array', 'null' ],
    minLength: 1,
    maxLength: length,
    items: new Validator.types.String(length),
    required: required || false
  }
};
Validator.types.RoleFilter = {
  type: [ 'string', 'array' ],
  enum: [ 'client', 'helper', 'subdepartment chief', 'department chief' ],
  minLength: 1,
  items: new Validator.types.Enum([ 'client', 'helper', 'subdepartment chief', 'department chief' ])
};

for (var property in Validator.types) {
  if (!Validator.types.hasOwnProperty(property) || typeof Validator.types[property] === 'function') {
    continue;
  }
  Validator.types[property] = function () {
    var type = {};
    for (var typeProperty in Validator.types[property]) {
      if (Validator.types[property].hasOwnProperty(typeProperty)) {
        type[typeProperty] = Validator.types[property][typeProperty];
      }
    }
    return function (required) {
      if (required) {
        type.required = required;
      }
      return type;
    };
  }();
}

Validator.presets = {
  nothing: {
    properties: {}
  },
  onlyTaskIdRequired: {
    properties: {
      taskId: new Validator.types.Serial(true)
    }
  }
};

Validator.filters = {
  'tasks:retrieve': {
    properties: {
      limit: new Validator.types.Integer(1, 50),
      offset: new Validator.types.Integer(0),
      order: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            column: new Validator.types.Enum([ 'created_at', 'updated_at' ], true),
            direction: new Validator.types.OrderingDirection(true)
          }
        }
      },
      filters: {
        type: 'object',
        properties: {
          closed_by_id: new Validator.types.SerialFilter(),
          type_id: new Validator.types.SerialFilter(),
          university_department_id: new Validator.types.SerialFilter(),
          subdepartment_id: new Validator.types.SerialFilter(),
          content: new Validator.types.StringFilter(128)
        }
      }
    }
  },
  'tasks:save-client': {
    properties: {
      content: new Validator.types.Text(true),
      type_id: new Validator.types.Serial(true)
    }
  },
  'tasks:save-department chief': {
    properties: {
      id: new Validator.types.Serial(),
      content: new Validator.types.Text(true),
      type_id: new Validator.types.Serial(true),
      client_id: new Validator.types.Serial(),
      university_department_id: new Validator.types.Serial(true),
      subdepartment_id: new Validator.types.Serial()
    }
  },
  'tasks:close': Validator.presets.onlyTaskIdRequired,
  'tasks:remove': Validator.presets.onlyTaskIdRequired,
  'tasks:get helpers': {
    properties: {
      taskIds: {
        type: 'array',
        uniqueItems: true,
        required: true,
        minLength: 1,
        items: new Validator.types.Serial()
      }
    }
  },
  'tasks:add helper': {
    properties: {
      taskId: new Validator.types.Serial(true),
      helperId: new Validator.types.Serial(true)
    }
  },
  'tasks:remove helper': {
    properties: {
      taskId: new Validator.types.Serial(true),
      helperId: new Validator.types.Serial(true)
    }
  },
  'task comments:retrieve': Validator.presets.onlyTaskIdRequired,
  'task comments:save-client': {
    properties: {
      content: new Validator.types.Text(true),
      task_id: new Validator.types.Serial(true)
    }
  },
  'task comments:save-department chief': {
    properties: {
      id: new Validator.types.Serial(),
      content: new Validator.types.Text(true),
      task_id: new Validator.types.Serial(true),
      user_id: new Validator.types.Serial()
    }
  },
  'task comments:remove': {
    properties: {
      commentId: new Validator.types.Serial(true)
    }
  },
  'task types:retrieve': Validator.presets.nothing,
  'task types:save': {
    properties: {
      id: new Validator.types.Serial(),
      name: new Validator.types.String(60, true),
      subdepartment_id: new Validator.types.Serial()
    }
  },
  'subdepartments:retrieve': Validator.presets.nothing,
  'subdepartments:save': {
    properties: {
      id: new Validator.types.Serial(),
      name: new Validator.types.String(60, true)
    }
  },
  'university departments:retrieve': Validator.presets.nothing,
  'university departments:save': {
    properties: {
      id: new Validator.types.Serial(),
      name: new Validator.types.String(60, true)
    }
  },
  'profiles:retrieve': {
    properties: {
      limit: new Validator.types.Integer(1, 50),
      offset: new Validator.types.Integer(0),
      order: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            column: new Validator.types.Enum([ 'displayname', 'created_at', 'updated_at' ], true),
            direction: new Validator.types.OrderingDirection(true)
          }
        }
      },
      filters: {
        type: 'object',
        properties: {
          id: new Validator.types.SerialFilter(),
          displayname: new Validator.types.StringFilter(60),
          email: new Validator.types.StringFilter(60),
          phone: new Validator.types.StringFilter(60),
          role: new Validator.types.RoleFilter(),
          university_department_id: new Validator.types.SerialFilter(),
          subdepartment_id: new Validator.types.SerialFilter()
        }
      }
    }
  },
  'profiles:save': {
    properties: {
      displayname: new Validator.types.String(60, true),
      phone: new Validator.types.String(15)
    }
  },
  'profiles:save-department chief': {
    properties: {
      id: new Validator.types.Serial(),
      displayname: new Validator.types.String(60, true),
      phone: new Validator.types.String(15)
    }
  },
  'profiles:remove': {
    properties: {
      profileId: new Validator.types.Serial(true)
    }
  },
  'profiles:set role': {
    properties: {
      userId: new Validator.types.Serial(true),
      role: new Validator.types.UserRole(true)
    }
  },
  'profiles:set subdepartment': {
    properties: {
      userId: new Validator.types.Serial(true),
      subdepartmentId: new Validator.types.Serial(true)
    }
  },
  'profiles:set university department': {
    properties: {
      userId: new Validator.types.Serial(true),
      universityDepartmentId: new Validator.types.Serial(true)
    }
  }
};

/**
 * @param {Function} validate
 * @param {String|Object} entity
 * @param {Object} entry
 * @returns {Object}
 */
function validator(validate, entity, entry) {
  var legend;
  if (typeof entity === 'string') {
    legend = Validator.filters[entity];
  } else {
    legend = entity;
  }
  if (!legend) {
    return {
      valid: false,
      errors: [ { message: 'invalid entity type' } ]
    };
  }
  cleanObject(entry, legend);
  return validate(entry, legend);
}

function cleanObject(entry, legend) {
  var propertyLegend;
  if (legend.properties) {
    var property;
    for (property in entry) {
      if (!entry.hasOwnProperty(property)) {
        continue;
      }
      propertyLegend = legend.properties[property];
      if (propertyLegend == undefined) {
        delete entry[property];
      } else {
        if (propertyLegend.type instanceof Array) {
          // instructions inside that block are very dirty, implemented only for SerialFilter type
          // FIXME: refactor that method to be universal
          if ((propertyLegend.type.indexOf('null') === -1 || entry[property] !== null)) {
            if (propertyLegend.type.indexOf('integer') !== -1 && entry[property] == +entry[property]) {
              entry[property] = +entry[property];
            } else if (propertyLegend.type.indexOf('array') !== -1 && propertyLegend.items
              && entry[property] instanceof Array) {
              if (propertyLegend.items.type === 'object') {
                for (var k = 0; k < entry[property].length; ++k) {
                  cleanObject(entry[property][k], propertyLegend.items);
                }
              } else if (propertyLegend.items.type === 'integer' || propertyLegend.items.type === 'number') {
                for (var l = 0; l < entry[property].length; ++l) {
                  if (entry[property][l] == +entry[property][l]) {
                    entry[property][l] = +entry[property][l];
                  }
                }
              }
            }
          }
        } else if ((propertyLegend.type === 'integer' || propertyLegend.type === 'number')
          && entry[property] == +entry[property]) {
          entry[property] = +entry[property];
        } else if (propertyLegend.type === 'boolean') {
          if (entry[property] === '1' || entry[property] === 1 || entry[property] === 'true') {
            entry[property] = true;
          } else if (entry[property] === '0' || entry[property] === 0 || entry[property] === 'false') {
            entry[property] = false;
          }
        } else if (propertyLegend.type === 'object') {
          cleanObject(entry[property], propertyLegend);
        } else if (propertyLegend.type === 'array' && propertyLegend.items && entry[property] instanceof Array) {
          if (propertyLegend.items.type === 'object') {
            for (var i = 0; i < entry[property].length; ++i) {
              cleanObject(entry[property][i], propertyLegend.items);
            }
          } else if (propertyLegend.items.type === 'integer' || propertyLegend.items.type === 'number') {
            for (var j = 0; j < entry[property].length; ++j) {
              if (entry[property][j] == +entry[property][j]) {
                entry[property][j] = +entry[property][j];
              }
            }
          }
        }
      }
    }
    for (property in legend.properties) {
      if (!legend.properties.hasOwnProperty(property)) {
        continue;
      }
      if (entry[property] === undefined && legend.properties[property].default !== undefined) {
        entry[property] = legend.properties[property].default;
      }
    }
  }
}

if (module && module.exports) {
  module.exports = validator;
}