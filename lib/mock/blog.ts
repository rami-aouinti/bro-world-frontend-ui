export type ReactionType = "like" | "love" | "wow" | "haha" | "sad" | "angry" | "dislike";
export type ReactionAction = "like" | "dislike";

export interface BlogUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  enabled: boolean;
  photo: string | null;
}

export interface BlogReactionPreview {
  id: string;
  type: ReactionType;
  user: BlogUser;
}

export interface BlogCommentPreview {
  id: string;
  content: string;
  user: BlogUser;
  isReacted: boolean | null;
  totalComments: number;
  reactions_count: number;
  publishedAt: string;
  reactions_preview: BlogReactionPreview[];
  likes_count: number;
}

export interface BlogCommentWithReplies extends BlogCommentPreview {
  parentId?: string | null;
  comments?: BlogCommentWithReplies[];
  replies?: BlogCommentWithReplies[];
  children?: BlogCommentWithReplies[];
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string | null;
  slug: string;
  medias: unknown[];
  isReacted: boolean | null;
  publishedAt: string;
  sharedFrom: unknown;
  reactions_count: number;
  totalComments: number;
  user: BlogUser;
  reactions_preview: BlogReactionPreview[];
  comments_preview: BlogCommentPreview[];
}

export interface BlogApiResponse {
  data: BlogPost[];
  page: number;
  limit: number;
  count: number;
}

export const blogSampleResponse: BlogApiResponse = {
  data: [
    {
      id: "cff647ac-98f1-11f0-b42d-0242ac120008",
      title: "Lorem ipsum dolor sit amet consectetur adipiscing elit",
      summary: "Et non culpa reiciendis ut similique fugiat qui in eos sed et aut quia tempore.",
      content:
        "Minus asperiores aut error perferendis. Enim vitae itaque numquam iusto aliquid ratione voluptas. Dolore ea repellat temporibus quas ullam.\n\nIste consequuntur sed eos molestias. Id consequatur sint exercitationem fugit cupiditate quia.\n\nHic ut nam consectetur fuga. Harum blanditiis a ab aut odio facilis aut. Eum voluptas officia aperiam asperiores eos quibusdam autem tenetur. Explicabo culpa culpa recusandae et temporibus.\n\nMinus aut impedit magni et consequatur ut non labore. Quia cupiditate corporis vel hic temporibus numquam quis. Omnis quis eveniet beatae et.\n\nFacere ex itaque quam accusantium culpa minus. Nam exercitationem esse id velit est.",
      url: null,
      slug: "lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit",
      medias: [],
      isReacted: null,
      publishedAt: "2025-09-24T14:30:00+00:00",
      sharedFrom: null,
      reactions_count: 5,
      totalComments: 5,
      user: {
        id: "20000000-0000-1000-8000-000000000001",
        firstName: "Sebastien",
        lastName: "Doe",
        username: "john",
        email: "john.doe@test.com",
        enabled: false,
        photo: "https://bro-world-space.com/img/person.png",
      },
      reactions_preview: [
        {
          id: "cffbf594-98f1-11f0-a698-0242ac120008",
          type: "wow",
          user: {
            id: "20000000-0000-1000-8000-000000000003",
            firstName: "Sara",
            lastName: "Doe",
            username: "john-api",
            email: "john.doe-api@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
        },
        {
          id: "cffc0534-98f1-11f0-874c-0242ac120008",
          type: "like",
          user: {
            id: "20000000-0000-1000-8000-000000000001",
            firstName: "Sebastien",
            lastName: "Doe",
            username: "john",
            email: "john.doe@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
        },
      ],
      comments_preview: [
        {
          id: "cffa67d8-98f1-11f0-a2e8-0242ac120008",
          content:
            "Et numquam occaecati hic aut nostrum tempore distinctio hic doloribus voluptas.",
          user: {
            id: "20000000-0000-1000-8000-000000000001",
            firstName: "Sebastien",
            lastName: "Doe",
            username: "john",
            email: "john.doe@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
          isReacted: null,
          totalComments: 0,
          reactions_count: 6,
          publishedAt: "2025-09-24T02:54:44+00:00",
          reactions_preview: [
            {
              id: "cffb3bfe-98f1-11f0-b52a-0242ac120008",
              type: "sad",
              user: {
                id: "20000000-0000-1000-8000-000000000002",
                firstName: "Julien",
                lastName: "Doe",
                username: "john-logged",
                email: "john.doe-logged@test.com",
                enabled: false,
                photo: "https://bro-world-space.com/img/person.png",
              },
            },
            {
              id: "cffb4b4e-98f1-11f0-9c67-0242ac120008",
              type: "like",
              user: {
                id: "20000000-0000-1000-8000-000000000001",
                firstName: "Sebastien",
                lastName: "Doe",
                username: "john",
                email: "john.doe@test.com",
                enabled: false,
                photo: "https://bro-world-space.com/img/person.png",
              },
            },
          ],
          likes_count: 4,
        },
        {
          id: "cff91a36-98f1-11f0-b049-0242ac120008",
          content: "Qui consequatur fugiat assumenda est error sit.",
          user: {
            id: "20000000-0000-1000-8000-000000000003",
            firstName: "Sara",
            lastName: "Doe",
            username: "john-api",
            email: "john.doe-api@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
          isReacted: null,
          totalComments: 0,
          reactions_count: 3,
          publishedAt: "2025-09-24T02:54:43+00:00",
          reactions_preview: [
            {
              id: "cff9e678-98f1-11f0-977f-0242ac120008",
              type: "angry",
              user: {
                id: "20000000-0000-1000-8000-000000000005",
                firstName: "Admin",
                lastName: "Doe",
                username: "john-admin",
                email: "john.doe-admin@test.com",
                enabled: false,
                photo: "https://bro-world.org/uploads/avatar/team-4-68763f1b4e9728.49066840.jpg",
              },
            },
            {
              id: "cffa0fae-98f1-11f0-ac19-0242ac120008",
              type: "love",
              user: {
                id: "20000000-0000-1000-8000-000000000001",
                firstName: "Sebastien",
                lastName: "Doe",
                username: "john",
                email: "john.doe@test.com",
                enabled: false,
                photo: "https://bro-world-space.com/img/person.png",
              },
            },
          ],
          likes_count: 3,
        },
      ],
    },
    {
      id: "cffc5a16-98f1-11f0-b4ec-0242ac120008",
      title: "Pellentesque vitae velit ex",
      summary:
        "Quia facere minus ducimus rerum et aut et pariatur qui ut modi aspernatur in aut porro sit.",
      content:
        "Cupiditate et illo sunt incidunt corporis itaque soluta. Necessitatibus omnis est fugiat quo debitis at et. Suscipit quod quaerat voluptatem voluptatem nesciunt.\n\nQui nulla fuga provident voluptatibus corrupti cupiditate. Sequi non ea optio alias vel provident mollitia voluptas. Excepturi velit rerum et. Consequatur eligendi nobis praesentium nam sunt.\n\nRecusandae quis quae fugiat excepturi. Veritatis ut autem aut nesciunt possimus a illum perferendis. Iure sit ipsa veritatis esse et sit maiores. Laboriosam commodi suscipit pariatur officia saepe.\n\nRepudiandae quia est dolor dolores. Sequi cum vero possimus qui laborum beatae. Cupiditate nihil quae et voluptatem cum laborum quisquam fugiat. Cum libero nam qui architecto sunt cupiditate eveniet.\n\nQuidem sit ab animi iusto. Optio nisi quidem maiores eum repellat. Voluptatibus sint odit omnis. Minus vel reiciendis velit eaque iusto veniam autem.",
      url: null,
      slug: "pellentesque-vitae-velit-ex",
      medias: [],
      isReacted: null,
      publishedAt: "2025-09-23T08:27:00+00:00",
      sharedFrom: null,
      reactions_count: 3,
      totalComments: 7,
      user: {
        id: "20000000-0000-1000-8000-000000000003",
        firstName: "Sara",
        lastName: "Doe",
        username: "john-api",
        email: "john.doe-api@test.com",
        enabled: false,
        photo: "https://bro-world-space.com/img/person.png",
      },
      reactions_preview: [
        {
          id: "d00289c2-98f1-11f0-a673-0242ac120008",
          type: "angry",
          user: {
            id: "20000000-0000-1000-8000-000000000004",
            firstName: "Nina",
            lastName: "Doe",
            username: "john-user",
            email: "john.doe-user@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
        },
        {
          id: "d0029ba6-98f1-11f0-bf6f-0242ac120008",
          type: "love",
          user: {
            id: "20000000-0000-1000-8000-000000000003",
            firstName: "Sara",
            lastName: "Doe",
            username: "john-api",
            email: "john.doe-api@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
        },
      ],
      comments_preview: [
        {
          id: "d001ac14-98f1-11f0-aa8d-0242ac120008",
          content:
            "Quo ut consequatur fugit saepe voluptate qui exercitationem voluptas architecto praesentium ratione.",
          user: {
            id: "20000000-0000-1000-8000-000000000001",
            firstName: "Sebastien",
            lastName: "Doe",
            username: "john",
            email: "john.doe@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
          isReacted: null,
          totalComments: 0,
          reactions_count: 3,
          publishedAt: "2025-09-24T02:54:46+00:00",
          reactions_preview: [
            {
              id: "d001e62a-98f1-11f0-b04a-0242ac120008",
              type: "haha",
              user: {
                id: "20000000-0000-1000-8000-000000000005",
                firstName: "Admin",
                lastName: "Doe",
                username: "john-admin",
                email: "john.doe-admin@test.com",
                enabled: false,
                photo: "https://bro-world.org/uploads/avatar/team-4-68763f1b4e9728.49066840.jpg",
              },
            },
            {
              id: "d001fa7a-98f1-11f0-97df-0242ac120008",
              type: "love",
              user: {
                id: "20000000-0000-1000-8000-000000000006",
                firstName: "Bro",
                lastName: "World",
                username: "john-root",
                email: "john.doe-root@test.com",
                enabled: false,
                photo: "https://bro-world.org/uploads/avatar/team-4-686c002aeab759.31816587.jpg",
              },
            },
          ],
          likes_count: 2,
        },
        {
          id: "d00104e4-98f1-11f0-a9ff-0242ac120008",
          content:
            "Inventore recusandae qui totam perspiciatis eos cumque harum voluptas sed perspiciatis pariatur id quos rerum.",
          user: {
            id: "20000000-0000-1000-8000-000000000004",
            firstName: "Nina",
            lastName: "Doe",
            username: "john-user",
            email: "john.doe-user@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
          isReacted: null,
          totalComments: 0,
          reactions_count: 4,
          publishedAt: "2025-09-24T02:54:45+00:00",
          reactions_preview: [
            {
              id: "d0016970-98f1-11f0-9a1f-0242ac120008",
              type: "haha",
              user: {
                id: "20000000-0000-1000-8000-000000000001",
                firstName: "Sebastien",
                lastName: "Doe",
                username: "john",
                email: "john.doe@test.com",
                enabled: false,
                photo: "https://bro-world-space.com/img/person.png",
              },
            },
            {
              id: "d0017ca8-98f1-11f0-91cc-0242ac120008",
              type: "like",
              user: {
                id: "20000000-0000-1000-8000-000000000004",
                firstName: "Nina",
                lastName: "Doe",
                username: "john-user",
                email: "john.doe-user@test.com",
                enabled: false,
                photo: "https://bro-world-space.com/img/person.png",
              },
            },
          ],
          likes_count: 2,
        },
      ],
    },
    {
      id: "d0030712-98f1-11f0-a7f6-0242ac120008",
      title: "Mauris dapibus risus quis suscipit vulputate",
      summary:
        "Perspiciatis esse quae non voluptas quidem quia exercitationem rerum officia corrupti voluptatem suscipit voluptatem.",
      content:
        "Aut asperiores facilis numquam quas officia ad molestiae vero. Veniam voluptates qui ex voluptas. At commodi voluptate animi doloremque voluptate provident.\n\nQuos eius maiores dolore blanditiis molestiae. Est consequatur voluptas ab facere et eos nihil. Sint quod architecto eveniet iste iusto.\n\nQuibusdam sint explicabo consequuntur iusto. In corrupti quo praesentium quia. Sit atque voluptates ipsam est a molestiae eius.\n\nSunt repellat aut est. Quidem sint et a voluptatum repellat eos iusto. Labore et sequi nostrum dolorum temporibus omnis. In ea non tempore ipsam id accusamus est.\n\nSint rerum occaecati quia. Ratione laboriosam harum ducimus. Maxime rerum culpa aliquam vel ullam perspiciatis accusantium.",
      url: null,
      slug: "mauris-dapibus-risus-quis-suscipit-vulputate",
      medias: [],
      isReacted: null,
      publishedAt: "2025-09-22T10:23:00+00:00",
      sharedFrom: null,
      reactions_count: 6,
      totalComments: 5,
      user: {
        id: "20000000-0000-1000-8000-000000000004",
        firstName: "Nina",
        lastName: "Doe",
        username: "john-user",
        email: "john.doe-user@test.com",
        enabled: false,
        photo: "https://bro-world-space.com/img/person.png",
      },
      reactions_preview: [
        {
          id: "d005b1b0-98f1-11f0-a222-0242ac120008",
          type: "sad",
          user: {
            id: "20000000-0000-1000-8000-000000000004",
            firstName: "Nina",
            lastName: "Doe",
            username: "john-user",
            email: "john.doe-user@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
        },
        {
          id: "d005ccea-98f1-11f0-81be-0242ac120008",
          type: "love",
          user: {
            id: "20000000-0000-1000-8000-000000000002",
            firstName: "Julien",
            lastName: "Doe",
            username: "john-logged",
            email: "john.doe-logged@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
        },
      ],
      comments_preview: [
        {
          id: "d004e85c-98f1-11f0-85bb-0242ac120008",
          content: "Aliquam accusamus a praesentium eum vitae tenetur praesentium.",
          user: {
            id: "20000000-0000-1000-8000-000000000004",
            firstName: "Nina",
            lastName: "Doe",
            username: "john-user",
            email: "john.doe-user@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
          isReacted: null,
          totalComments: 0,
          reactions_count: 3,
          publishedAt: "2025-09-24T02:54:44+00:00",
          reactions_preview: [
            {
              id: "d0053b7c-98f1-11f0-9e56-0242ac120008",
              type: "sad",
              user: {
                id: "20000000-0000-1000-8000-000000000001",
                firstName: "Sebastien",
                lastName: "Doe",
                username: "john",
                email: "john.doe@test.com",
                enabled: false,
                photo: "https://bro-world-space.com/img/person.png",
              },
            },
            {
              id: "d005612e-98f1-11f0-af05-0242ac120008",
              type: "love",
              user: {
                id: "20000000-0000-1000-8000-000000000004",
                firstName: "Nina",
                lastName: "Doe",
                username: "john-user",
                email: "john.doe-user@test.com",
                enabled: false,
                photo: "https://bro-world-space.com/img/person.png",
              },
            },
          ],
          likes_count: 3,
        },
        {
          id: "d0047368-98f1-11f0-9ca9-0242ac120008",
          content: "Facere nisi fuga neque voluptatum molestiae consequatur perspiciatis.",
          user: {
            id: "20000000-0000-1000-8000-000000000002",
            firstName: "Julien",
            lastName: "Doe",
            username: "john-logged",
            email: "john.doe-logged@test.com",
            enabled: false,
            photo: "https://bro-world-space.com/img/person.png",
          },
          isReacted: null,
          totalComments: 0,
          reactions_count: 1,
          publishedAt: "2025-09-24T02:54:43+00:00",
          reactions_preview: [
            {
              id: "d004d3ee-98f1-11f0-a8da-0242ac120008",
              type: "haha",
              user: {
                id: "20000000-0000-1000-8000-000000000006",
                firstName: "Bro",
                lastName: "World",
                username: "john-root",
                email: "john.doe-root@test.com",
                enabled: false,
                photo: "https://bro-world.org/uploads/avatar/team-4-686c002aeab759.31816587.jpg",
              },
            },
          ],
          likes_count: 2,
        },
      ],
    },
  ],
  page: 1,
  limit: 10,
  count: 300,
};
