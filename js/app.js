function person(name, age, group){
	this.name = name;
	this.age = age;
	this.group = group;
} 


var pers = new person('Pavel', 19, 'ПВ1013');

console.log(pers.name + ', age : ' + pers.age);
