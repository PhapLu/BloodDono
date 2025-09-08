import AccessControl from "accesscontrol"
const ac = new AccessControl()

const roles = () => {
	ac.grant("member").deleteOwn("profile").updateOwn("profile").readOwn("profile").createOwn("profile")

	ac.grant("hotel").extend("member").readAny("profile")

	ac.grant("admin")
		.extend("hotel")
		.updateAny("profile")
		.deleteAny("profile")
		.createAny("profile")

  	return ac
}

export default roles()
