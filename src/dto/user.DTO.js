export default class UserDTO {
	constructor(user) {
		this.name = `${user.first_name} ${user.last_name}`;
		this.email = user.email;
		this.age = user.age;
		this.role = user.role;
		this.cartId = user.cart?._id?.toString();
	}
}