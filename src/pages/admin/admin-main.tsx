import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export const AdminMain = () => {
  return (
    <div>
      <Helmet>
        <title>Admin | Nuber Eats</title>
      </Helmet>
      <div className=" container mt-8">
        <Link to="/add-category">Create Category</Link>
      </div>
    </div>
  );
};
