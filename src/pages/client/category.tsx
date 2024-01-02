import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  CategoryQuery,
  CategoryQueryVariables,
} from "../../__generated__/graphql";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { Restaurant } from "../../components/restaurant";

export const CATEGORY_QUERY = gql`
  query category($input: CategoryInput!) {
    category(input: $input) {
      ok
      error
      totalPages
      totalResults
      category {
        id
        name
        coverImg
        slug
        restaurantCount
        restaurants {
          id
          name
          coverImg
          category {
            name
          }
          address
          isPromoted
        }
      }
    }
    allCategories {
      ok
      error
      categories {
        id
        name
        coverImg
        slug
        restaurantCount
      }
    }
  }
`;

interface ICategoryParams {
  slug: string;
}

interface IFormProps {
  searchTerm: string;
}

export const Category = () => {
  const params = useParams<ICategoryParams>();
  // page button
  const [page, setPage] = useState(1);

  const { register, handleSubmit, getValues } = useForm<IFormProps>();
  const history = useHistory();

  const onSearchSubmit = () => {
    const { searchTerm } = getValues();
    // /search와 값을 URL로 보내기
    history.push({
      pathname: "/search",
      // state을 사용하면 유저에게 값을 보여주지 않을 수 있음
      search: `?term=${searchTerm}`,
    });
  };

  const { data, loading, fetchMore } = useQuery<
    CategoryQuery,
    CategoryQueryVariables
  >(CATEGORY_QUERY, {
    variables: {
      input: {
        page,
        slug: params.slug,
      },
    },
  });
  const onNextPageClick = () => {
    setPage((current) => current + 1);
    fetchMore({
      variables: {
        input: {
          page: page + 1,
          slug: params.slug,
        },
      },
    });
  };
  const onPrevPageClick = () => {
    setPage((current) => current - 1);
    fetchMore({
      variables: {
        input: {
          page: page - 1,
          slug: params.slug,
        },
      },
    });
  };
  // page 초기화
  const onLinkClick = () => {
    setPage(1); // 링크 클릭 시에 페이지 초기화
    fetchMore({
      variables: {
        input: {
          page: setPage,
          slug: params.slug,
        },
      },
    });
  };
  return (
    <div>
      <Helmet>
        <title>Category | Nuber Eats</title>
      </Helmet>
      <form
        onSubmit={handleSubmit(onSearchSubmit)}
        className="bg-gray-800 w-full py-40 flex items-center justify-center"
      >
        <input
          {...register("searchTerm", { required: true, min: 3 })}
          type="Search"
          className="input rounded-md border-0 w-3/4 md:w-3/12"
          placeholder="Search Restaurants..."
        />
      </form>
      {!loading && (
        // 레스토랑, 카테고리
        <div className=" max-w-screen-xl pb-20 mx-auto mt-8">
          {/* 카테고리 */}
          <div className="flex justify-around max-w-sm mx-auto">
            {data?.allCategories.categories?.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                onClick={onLinkClick}
              >
                <div className="flex flex-col group items-center cursor-pointer">
                  <div
                    className="w-16 h-16 bg-cover group-hover:bg-gray-100 rounded-full"
                    style={{ backgroundImage: `url(${category.coverImg})` }}
                  ></div>
                  <span className="mt-1 text-sm text-center font-medium">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {/* ?는 optional chaining 타입스크립트가 확이한다는걸 의미
                results가 없으면 멈추고 실행하지 않음
            */}
          <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
            {data?.category.category?.restaurants?.map((restaurant) => (
              <Restaurant
                key={restaurant.id}
                id={restaurant.id + ""}
                coverImg={restaurant.coverImg}
                name={restaurant.name}
                categoryName={restaurant.category?.name}
              />
            ))}
          </div>
          {data?.category.totalPages !== 0 ? (
            <div className="grid grid-cols-3 text-center max-w-md items-center mx-auto mt-10">
              {page > 1 ? (
                <button
                  onClick={onPrevPageClick}
                  className=" focus:outline-none font-medium text-2xl"
                >
                  &larr;
                </button>
              ) : (
                <div></div>
              )}
              <span>
                Page {page} of {data?.category.totalPages}
              </span>
              {page !== data?.category.totalPages ? (
                <button
                  onClick={onNextPageClick}
                  className=" focus:outline-none font-medium text-2xl"
                >
                  &rarr;
                </button>
              ) : (
                <div></div>
              )}
            </div>
          ) : (
            <div></div>
          )}
        </div>
      )}
    </div>
  );
};
