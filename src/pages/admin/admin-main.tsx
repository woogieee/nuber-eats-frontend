import { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  AllCategoriesDocument,
  AllCategoriesQuery,
  AllCategoriesQueryVariables,
  DeleteCategoryMutation,
  DeleteCategoryMutationVariables,
} from "../../__generated__/graphql";

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

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [deleteCategoryMutation] = useMutation<
    DeleteCategoryMutation,
    DeleteCategoryMutationVariables
  >(DELETE_CATEGORY_MUTATION);

  const handleCheckboxChange = (categoryId: number) => {
    const isSelected = selectedCategories.includes(categoryId);
    if (isSelected) {
      setSelectedCategories((prevSelected) =>
        prevSelected.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories((prevSelected) => [...prevSelected, categoryId]);
    }
  };

  const handleDeleteCategories = async () => {
    for (const categoryId of selectedCategories) {
      try {
        await deleteCategoryMutation({
          variables: {
            input: { categoryId },
          },
          refetchQueries: [{ query: AllCategoriesDocument }],
        });
      } catch (error) {
        console.error(
          `Failed to delete category with id ${categoryId}: ${error}`
        );
      }
    }
    // Clear the selected categories after deletion
    setSelectedCategories([]);
  };

  return (
    <div>
      <Helmet>
        <title>Admin | Nuber Eats</title>
      </Helmet>
      <div className=" container mt-8">
        <div className="flex justify-around max-w-sm mx-auto">
          {data?.allCategories.categories?.map((category) => (
            <label key={category.id}>
              <div className="flex flex-col group items-center cursor-pointer">
                <div
                  className="w-16 h-16 bg-cover group-hover:bg-gray-100 rounded-full"
                  style={{ backgroundImage: `url(${category.coverImg})` }}
                ></div>
                <span className="mt-1 text-sm text-center font-medium">
                  {category.name}
                </span>
                <div>
                  <input
                    type="checkbox"
                    value={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCheckboxChange(category.id)}
                  />
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="max-w-screen-xl mx-auto mt-5 text-center">
          <Link className="text-lime-600 hover:underline" to="/add-category">
            Create Category
          </Link>
          <button
            onClick={handleDeleteCategories}
            disabled={selectedCategories.length === 0}
            className="bg-red-500 text-white px-4 py-2 rounded ml-4"
          >
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
};
