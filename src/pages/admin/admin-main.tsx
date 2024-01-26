import { gql, useQuery } from "@apollo/client";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  AllCategoriesDocument,
  AllCategoriesQuery,
  AllCategoriesQueryVariables,
} from "../../__generated__/graphql";
import { Button } from "../../components/button";

const DELETE_CATEGORY_MUTATION = gql`
  mutation deleteCategory($input: DeleteCategoryInput!) {
    deleteCategory(input: $input) {
      ok
      error
    }
  }
`;

export const AdminMain = () => {
  const { data } = useQuery<AllCategoriesQuery, AllCategoriesQueryVariables>(
    AllCategoriesDocument
  );
  const deleteCategory = () => {
    console.log("asd");
  };
  return (
    <div>
      <Helmet>
        <title>Admin | Nuber Eats</title>
      </Helmet>
      <div className=" container mt-8">
        <div className="flex justify-around max-w-sm mx-auto">
          {data?.allCategories.categories?.map((category) => (
            <div className="flex flex-col group items-center cursor-pointer">
              <div
                className="w-16 h-16 bg-cover group-hover:bg-gray-100 rounded-full"
                style={{ backgroundImage: `url(${category.coverImg})` }}
              ></div>
              <span className="mt-1 text-sm text-center font-medium">
                {category.name}
              </span>
            </div>
          ))}
        </div>
        <div className="max-w-screen-xl mx-auto mt-5 text-center">
          <Link className="text-lime-600 hover:underline" to="/add-category">
            Create Category
          </Link>
          {/* <Button
            canClick={deleteCategory()}
            loading={}
            actionText='Delete Category'
          /> */}
        </div>
      </div>
    </div>
  );
};
