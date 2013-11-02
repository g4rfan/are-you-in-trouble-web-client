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
        type: 'object'
        // FIXME: improve filters requirements and updated filters structure in the server code
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
      university_department_id: new Validator.types.Serial(true),
      subdepartment_id: new Validator.types.Serial()
    }
  },
  'tasks:close': Validator.presets.onlyTaskIdRequired,
  'tasks:remove': Validator.presets.onlyTaskIdRequired,
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
  (typeof entity === 'string') ? (legend = Validator.filters[entity]) : (legend = entity);
  if (!legend) {
    return {
      valid: false,
      errors: [ 'Invalid entity type' ]
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
        if ((propertyLegend.type === 'integer' || propertyLegend.type === 'number')
          && entry[property] == +entry[property]) {
          entry[property] = +entry[property];
        } else if (propertyLegend.type === 'boolean') {
          if (entry[property] == '1' || entry[property] === 1 || entry[property] === 'true') {
            entry[property] = true;
          } else if (entry[property] == '0' || entry[property] === 0 || entry[property] === 'false') {
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
      if (entry[property] == undefined && legend.properties[property].default != undefined) {
        entry[property] = legend.properties[property].default;
      }
    }
  }
}

if (module && module.exports) {
  module.exports = validator;
}