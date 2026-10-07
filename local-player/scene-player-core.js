/*
 * Scene Player Core v1.13.0
 * Runtime for Scene Format v1.0
 * No splitter / studio authoring logic lives here.
 */
const AHAKO_COMMON_AVATARS={"m01":"data:image/webp;base64,UklGRjYDAABXRUJQVlA4ICoDAADQDwCdASpAAEAAPpE6mUilo6KhNfXeYLASCWcAykL1vkuSxwH7xDdLYW6bmZz5MPqn2BjBU+dHiRymGt+qxEsYGNUpPtw8J0tNaQZcEwXFe+yC5V/GeRsQZDfWtW7RY00p7qZopym5Do67/bXBEcgObucxV6Bk6H+PH0m3PGnF/d/MYQkNLEgA/v28yvSRQ9Ho7yrp5O2F7xDGBQCSJm46379/MItb52fmHmfoVj17ZrAxGsbWdxJCG6PjP0PHod4VZUDay6yOdsW2lRa46v+mPM4BHWouPQHoY/3eCbwJ9OZtdeKu2S92Nft0gM7wgyT5sgNXNqc5+TBNuQf0xOqcxssmy5GKU8J95r3u31IurfWIq84dDsqeX4mkoZoQDpYAa7PRuXvk5hBdXCGPaw1NDNjhV3rD7o9Pb7P9bX/SucSSrhlJaWftsQNNmbL3VpZkNA1OZEAniQMXfnZXkc1ZCtek6+gZ/Nkr2vipw1p/0Ghw1Gm80QEYiHSPs/95O9ztHHGBWRN5iEPPIpFpaLI5b01IvIUH9prq4ocsg2a645Q+JF2GVHMRV1x18G/Arfz8ZkyWcC73bgggEnjD6+jMnVpxwFceejxTpHi+Hq+L2T98GMkMLZ3ImXtfA4yIHMR7Uj3TWhyYsIzQ1KBDz+a99X3qzS9gTe/UqZbn+WHtoG+/Za5FhPN/mVjzt17yRr5s0jslgyPoamM1lPuM2cWH3fBl/Q/SKbOSqiGdjmuFasKY1SXQPG8ISTUmOO9Gfln8DaadeMqieCE+JrJHdOOsBnY44bIdsLXgfFTsRbq7eU9ptyIyiXjYMQXSXJDZ5SzTninEFSmm3C0m7miOv6/xSToTI28T+N0j4p8qq/YUSCWKuWv1kWfyDzJ66Mr35XuAJcyLUJT9eaLE+Vd6r368qh3yJ+iW348zHUd4VbQrlkRAEKiMr6mSMT1BaKnpQGJVZMipiaUpICoVtbL7XipJiM9RO9hWnkeisKyTWlPyyJd0J9B3Vdln2yjHfSmEcx5k7q+vm0wgEq//v4RnR/mGHQgljMrfMh/xc1d3JQi29KfVQVGSmgJTAAA=","m02":"data:image/webp;base64,UklGRpoDAABXRUJQVlA4II4DAADwEACdASpAAEAAPpU6lkiloyIhNfdOYLASiWMAwFwgibq7/KWGeOju5l6aXqal5EtQRVNCeW+Eiu0c8XcL9dlQkvVn+wJ8tBfpu3uNCvucALl7zvx7WCxM/K0EtPgSVOR2VKDHE/KHwNDY1tV5Gn+Yjg/OiZXc+hgWa8h60HYNvn7EROzOtMqyS9a6XdXjicAA/v6Ts/grQm1CxVgb3wTp3+wdWYrVsnMxEdKiSq1Neej2bMyXlruVdCD1lZ8ppefm3SWjYIUj5j9YqbBCAvfBqOXCCnMCdtbKDPqbqZyYtih/TmCVap3kgn0ppA4TSsMXoQ8o2vfc46ttU5ajXHZJBhD13X4zxzYTiQmkT4VSWO+TqIqb8sL5moOhTIhTvN+WBRhZPjQJK7bOFtPVvVMA5q6l0NhqtwHNsy0I2dDtIsLiTcQHoSBwuYAAD+RzIbGAQ0/MHLiORQorkHLR2FT0oztQ0GiZCmuQ3eUaz1AZrsrjrIqjEKeGkRUKccqCNNj8qlDNmHiFAFZXapB3VtluG/BONBlk74/PK1EbREecsCJQsbszQcpzelm4JLw6ISnl6a5qMf6MNCbU3kxSjyzVLOZkFW0y9+CenbP4O+h7LRYLGc8nKUZtWC4yV6haCjGBnMLxPsUBpxVjNVnqKH7DBcSKgFa3JinflR0syG7z56BaZyIh+RHhe6jhj2nD6Nj75Y6pqv1laGUQBfbf5L5YF732o+AYlN7zwq8wqhaHmbTedxLHUxae0pzV+L9iJazEiqY3v7js6+z8ALbRJ3HBweD2BXaU6kutbh/hbC43TebakD6r8R46P1Zqzz56k9IQBVBq8MbQy2GrXaXVQizyDFUM4NMyjNh1vnp2m2KI/fKyJVD9sKiXlazbZL1rULa5T0tsrGmUrOlxFuOZKRSg0ZYjvY5/w0rHLM6kXZklw0FtmCfxFpaNEKAJa6AiSSR9UmP4qS052nhBtOvaVwygQk3Bmseo1+CKbzs6AyooTjxpTMigq73FtI0NgVqHO4GSYTz+nOLpegnKVv30ya0RlOrxQjYA6zU9Y5fIk+fKUnE4ynGHjQHds4eg83ttO4pucFVimK6l7RChHwg3dTC8an9VequoykfT4aOF3z6p0N79bPXTcVigsY/lK5tXCoyuw7ARImnONge6WhxwmmhZ/CYUR/+7HA6JJzqjipu3zLtQ441FWXGsNc1w9MAA","m03":"data:image/webp;base64,UklGRmIDAABXRUJQVlA4IFYDAADQEACdASpAAEAAPqFEnEumIyKhqBgLUMAUCWUAxnP4CgDaj8nod8/wOUu0cKRm/RVaSE8t8JpHlM12arb6EIVdsXk4CD0DCZfPI7R808EC5AdzGEqi8jjuJrhAdYc0saiuZVnOP9RS4JdkHAC6NNrjWQyj4TUPkmSfExQf9d3EmbyM8+ZT7PkmKV8vSYGwAAD++Bzp4oTo60IUaSzZ5Ph5+3GQbXbb3GeNvgDbMdpvSER4b/vLdDsi+gjtokCOYOPwGhq0GREbS3FTLGcSrILxtw2P4OM8nIea8l10PxqvjFVtXOBchsKqRRd/OVFX/EEDbxe8xC4lpDGDwSGtwSmWOhtihpMtiW+Wve6qLdQxMwD7qGlm88vbPWTX3swC91CVj96DXfVnGZFkTMKETwHNCLYP+/zcSvre79HL5I0khGGoJr1ASQ1Vye/6UTO7Sm0KVxbHQzegpDXzS7fAMzX29JWoDx3Stf6sUf5yFkwJTa3d+K1M8R7BF/PE58dRGj3mri+o9FG70VbypmUQZgIfJ0bhprdkZ31lOE9eoXQt9N/oyIgtksxocqiZHUqRXNWVg58u0dOpfVee70bx36t6iSDPxAoJq3fCCFZgiBat4ywBnLOlKeHCQwU5Tp9Pw3LcVYaosFeOR9Fu4gVikMfVtAtStgY3pwsLcP6RLd89u2VlSAEK9MZ5Z4hr5pzB1izLRidoVnlQntntHMgJc/ZiDFhxsd9cVDJNfIFya6Kyxx+ePJWouR3nOt0itoSWjcfDckhbVXBI5r1/oL0Cvd0KkmULjU9SKGG6zTZKnYfNhuDV0yyds/Dj9pztIDX1XxHA5759mtTsVP35R8TCnbzbr3ygt81gU6LP2YoCiV/65TRcLo6XD+2ni3GHb6GLBIdptDuz4O6G/PGf/s5OAZR2+q1LMm/+3hsqdpk8wEjzHBZ/qULXpXB0LGgg1RAXOREbC1l+JBeG+JfuEFkdPC6l7H8b1bBovgmVWeVIDOBjTfktiXzK0Bb5SZPtxdFMz3A0obncEbukRL5JOvjhQot4t7dWkTNjf0RJ143UU40YqbngQbWUdvoPeY+e4K26ll6dv1k6+Kt1fHOvtR0fuNhrcFN7cV/z4hdlhXbhbb9UUKFbygAAAA==","m04":"data:image/webp;base64,UklGRuoCAABXRUJQVlA4IN4CAADwDgCdASpAAEAAPp0+mEiloyIhM/mZWLATiWcAz+ANF06Kwu636p1Ctm6KWRpCneYydi9u9gsNLMKGJhXAuP7pxYgEgJL8ag8F7VTAr/KGOWOyQAkZW0y5edMBVj57dqCwfdGCalXjPcdTQniCr+DtKdonVe124HfpZVW0uK9+AAD+/xIdGqukPf+bYvET9XWxrPbZXDvw7n6N4Un/oPwF7fyz+rStixtwu2dU6CU7J/M8a59udzHo+Ro5gOB/P85rD7Qh94PRNj/r33OX1fG6krKlGvBbveXTtAFb/azKYzeBA8zTjEBf8NZazL2bn9UphF+rM+bI9vmOOlKRzhm4LFtZ2f9AkGxedNkCl0EzF0tk0aXpa7oM0up8dA9C3QFYdWycDj8cvjODVctdPUtAf6kbKQkBtkTo+q18WBMJ3Gsgf2+F/SSh44GPqQF0oipOu4Dy63MpoWkYFLI+5IlmlW6sWcNM8u8T8ooYLtl1G3qALG5ianKZYMOIKZdooV8qTD0eOeH4gKquRvUYmjRys8ZIsnWd7mqPsxJAkC3HrlYmph6+kbV8xnEOxiOqCqGd+t4rUMF1paaH5XXJNzj2elpinOA+H/3sri/M05zj90nIde9fmoF0Uc1EmJJYrq/gT/Or7MrVHoAqHGwfDRXnx6/jPrqEOqLc4oOepkbOEz7/CMWdN0n6B1pXTUsG3EQoqoCRqzJAifTkbOkuIxy1JciPtrgQbS0xrIqIOqJrZQd56EDXfwJCFaH2kM4WdPOKEpy6vCtKUQn1ba1bnCnOhbGrD8x0gEbmj2pgsLBirI7g240dwXDgUpJmId5oqgwUcqBy7mOF7swm9WhJBgyomqz/Q17vdibEY9ei75sKz/2WlMu5/5DNQI5DfaDWiu5P7u2aA6WTdDRc+L2hP7MibcGOF0L+fb5UGcHpDreK7tdFT2rttfvOnoCu7re1ZWHAg7fju5OL/+D2vdAAAA==","m05":"data:image/webp;base64,UklGRhoEAABXRUJQVlA4IA4EAACwEQCdASpAAEAAPqFEmUimJCIhMBQM+MAUCWcAw3a/uI9Yc/CcWK1XvI8EtNPj99DnO99NewT+uTA9jFIbICOEf1kZtrSkICZx/q3sodOdSCORIuMrkoOMEUXSl84d1LaHMAisqZTjI+Z+mirep+1oVJS6sg9kQ7JHm8YD/Fc/PQEpB6j/ArcbQ+pXHf76NhkxBEHVkJAA/v8SHaK65t1hn1q13SCM1GCG+goYvmC/vyG5BYNRIgOwRd1wrlSVQuLoQ6Ou/JsaUAL4hWw3IF4XPKOqqKUOogq3Kzuy/u/Nl6lQCppnE9Fww6p4yFEf3fNg4idGjMSmfKSvBcwQfNlXQg2/Ya+kIj3yoYO4gCYaPc0lVEvXblwyAmCzZ1J0YpLdyX0LgBO+ARq0tKMdQun2ncknl4+ZahTnl2DAgDaaKBFl8wCSujxIz+XpASPhl9t5OEelz/c8nLtkI2emz6nfDaxsyGF7T+6wxGi3j+f+SyrIvtMjiKIyVvahxY1RHtYIrM3swPnAUTr7Tzf3b4VpP7Q1BYLHT93yEUCzrQ7inKUhvSl/e1XyMX2U/zpNyV0I3pYJOv97OqELT1RuQLX+vb9/S+9bRfb+ojUaa5jfP8r2ZK59Tbs2/AvxHofyDT37HmLOEdyxGa6N0xToFqnahyaMr40JyjHa42pOVoq+vXRea5SI5InPS4TV/Kf/LEcdAOSESS0FnsLkqbPMQBgBFgU2TG7hqwuA26TTSg/SVe8glWkP+kBafCT3N3QndDsulLmAETXIhzx2EFwUH78OV0MdElchNJtJuWDN/Lt4TK3qsaPEdiizlxLJv01jFXFKO7kzs/lpX912jhMB0wKmHgk1WGKhgJsJ4s0ei//qLs0iush9S80RXkBOvI7nnl78ON5N9C5GRd4+jxIFMB890Sn5GUYXUbA/reblv1+h6X+4i2iVSs7KyyxyIEUVoq5fDNxdqITlBgYzPhrUCbEHlIblWlxI6H0fFUp9FxJcPK6RAJARSRMgu4pzF0rblGXULBI1N0lTsUF7IQ8GKUXYInMwX//a5cij+dH6fqtCOPblOgX4QgGysI18cunBMKP/oGNCOrRnmbNdOHV7Tw/F1DA6aL1zLZyLzFZxF73J97w0xTrCme0NSaEm0rX8+O6SOeaX+E6sd3Z3QCYZZqz0laxTB46RTXft+HySM+UsPfKyBEuMldXPw7YhaR5QRNb7ofB+8CYh3agVsDFTcQ2pzlw/fi+TE29Twn5KmxFx8ETDq9r0+nyHlXl8t8eRDT0YwqZ+WLyIDmyS5261biTlWf0D8fCv5UEfknmqOc8bLiVAa/jT191LatbuWtqf+m/dRYeelvAU9idH+RUi9tc8SnPJFwHz0UDXIOcAAAA=","m06":"data:image/webp;base64,UklGRg4EAABXRUJQVlA4IAIEAAAwEgCdASpAAEAAPpU+mEilo6KhM/zKqLASiWMAvJvGQTvO+83yiAJjTDgZeOngmk+R/v39drmnH8P9xvatqIxx7cTyBBatpcPfj+uGLKfcJ2H4JYMSXrm5mKQ7q3fNY1pwDnK21liRNw6Y6UP285P57aodwcaRfkzQXHHjHmUdRXRv3YvKaJ1lEBayVIoBzotFZlVomqR9OMygAP7/Eh2ZzjE/OgipXD54FkVgwE0aat9v/pTJH3+e/O4Qe9sGdfo4iab+GW+ItzcuvCaPF46j0vhzISaSmbRUmEzMWhf9sQzMkc55NoiCKEGqciOr2fIY9r4Gg346MM5rxOvr7xqOzLfFJ+TRdGj05RnWj5MZi/rFxZdoYhBLgk7Xsa2dh+nsoZhKreUIAb7cVhxyzBiH0XOzN4Zr5PzLV/l1fXXU0LoVEx5xBzayTntuz26oe64IGojtXioLyLFtGic8mtAHcAV456gHRpe9C4wErDI0UToHFbg7Q5uchAUdwjJ0pDWnTwWqf73/Dfs8vgq33Xa69t+0YLiFef6QDPMZOaUEJhSzGBMWjViuDwoBCNx6cxNAGv6i1hqRV19dqQZ6/at1MD9USC8+iMfRUU2isn+jForDU7t/sVm6A1U35LxTVgoNJ2w8VMgFiDB6x5P/yF1Oq74OpqAVNR+Cf9IhaUIvimmFj9Z+BKQI9HnVjiStIKtLmXj31FFykCORNagTKfhiutvTLKVWjGtEF9df6sjmnks2/Wa7vv1O3vyuCXq/a1gzA4/dbXiva1vdEqHMf+ghxaEpxiUQPTUYUBa6bUQ399HVfJXFqXhBjT8D/+NnE5XLnikJs7V8KLEXi8q/NPHpEA0NzhBoAiCeVa1eQuIXpb98qFERj6OMdtVFMKfQWn1Zw5zeVxyVScU/i+cKSg72WYHZaaQSmdcZ/dxJ5RwkVGjss9l79/c7VMHP419XE88QETJKHNL6BGEnxuaZA/Zs76MsQ+RlOigUwThFxrHDx7jsxWGrRUVN5Aac4f3XFPujBKV/ul0snXn1MRYNE7NTMQfbnnP0rIgoG0MnHzurnsUPGOMhqlSYdUVCL+wGgTIeiwpTM8FU9FK+/CFos417FkhH6S3mFo2FBT6bfo2L74PN8Z7hGfnBDyhGID+JolrKq0tH45IDnbL4TOpUs40SiIIk7o4nZlkiky7Qeh0GN4zYvEpNn7ss83GGOPcq83OFCug+LcLhcvazoFNS/HV+gn6d+aCq0+Ft8s63nxxwztxpmYHcjYM+sE/Cx8lMLU0TRfkaZlu1U8c497LQUW8ois6ZIJDhSnWsdZETeGzS7PE8E71w7bH69J72U4WsnoYw0wtvrVYNuCLHOdpybqC1vAA=","f01":"data:image/webp;base64,UklGRlgDAABXRUJQVlA4IEwDAACwDwCdASpAAEAAPqFIoEwmI6MiJBgK2MAUCWUAxQwr99uOZucDble80vyPahaV2xpJm2t0nNlolgSgAtHZYwgUiP107lI+OgTB7+YPFzo/Thi4QEcaI4umKB6AhZ/ehIjtouaeZRwESgHJnB9b/edNT/1t5eUEcrp+82wDZxYy6FytsooTgAD+/np5tFM9R0DoTYq1HWhhWCTjuKNunPbTNPajZd+YXf/tpE/+kuicngocXPF1Og42aweJmXKfMh3gMrNcQEqEQMTEPG6ROmPSYybxOYSiofdHwvBHRVxc5bTHYDkGi6r8LbLOLTfShru4deyNDZDHHhGZ+xkIEiNByLZ5leMKCSiauUUOF+ppYwvyD7X4y+9c2KX4dxW2yMt9YXG/NjQAQKPkhA20seafje/b0LjuqMkqNV4S3YNZMc2JO0KYCAYLJ8wOUz1/W004fYUa8KZ8CsUOwZDDwpS1B8jkg24xhNSFbHulc9kE8EeLRc09DUnCIl1t8KXcKmKoRmMGvgFRAVcFCSzdANg4zKkfPoIO6+e8d5GECbcdpu1I4kilnEogTQUmfUmLxRkaute91el2JZe9tL+UrflhpdygvfSvavD9tc1SlR2gSghZnRbWmlAIoyGQyQ8VPbUdlaOj0tUxu7rD8K3YVE/zbxc9a/ZJPL3Fbbk8lTCf0S+5INkv/uBVCFMhF4G6WiuaHolPHE3iKHfFVmsy8iyv65jdkG3doM8o5evWklDfZa3Tlun7GY9iU89TQOIDCmf88oliRhCQuKfNHNoTtQbHR6bdbWj5lMaJvBn3cb6AlFsbKhPz808+9pNst8zkeWTZzLkhn6/+OkWnZObsomyfrkWe5isE33bMq5qee+X9Ov+pFzu+gsmb2qV/uMSQhjIvzfyd/DGI0o6m6tYHLwYmplwgnv/opl5At8dpkNUSoE8ojAwtwT3gjKb01MkUEMtsNE3RE+JEraIA2niP8iV5Z64UkW6Q+yEwzOzmFNW8m77OY7XdKp3pM1zPgdMZvcXxrU6mTVOPUwb1Tx+gIsZgOU4PRZjSrD+XKRylb/qOKAz3n/ZSdwFfHJnYg8zZ/0maOVPYUAhK+VKgHSucoJJcW69VCWPIUwwtKtQA","f02":"data:image/webp;base64,UklGRrgCAABXRUJQVlA4IKwCAADwDgCdASpAAEAAPqFKnUsmJCKhphVc6MAUCWMAyjO8yw+xUj3gq904bWsLbyeZH0EM4H3rhvkL8evIw7P4s7XDUsHcUOC85YdRu9D34kc0xuze9LckJBF7lyxesc/ypcW02L2parZDdmxiLElBxNQG1/Sdr8nw/qB8c5pBh2uKAAD+/pOrBkMghqTCYGzRf+qFgwZyzGuJ/sJ8bytWCPB/e8X0utjKXJ6mdhrIOr3FQCqD3fMOP7GNfm9wUV6PWB+89JFfOCIT7Lm1J1IWluku4+cvzZPbGZLgy6J85AkytLov6AmJi2FmPLOlFfi9WCcDvNs3tTePjaD2QCodq8lscRlwTZzQCKreX0bGpJDDkqxZzZ6HEM/vt7ah4GPzZqVixAfBgOa1MFDTKpoMTuL11+9fd+1Ii9v+TzYCKDLs2hXuWSqYoLA1ejD1incBE8Yepk5KxIAT4CUw27yyTB8KpYkrQ6fBYQZywXl7dJazCX2/ZM7+w16LC6Z5RC1+6LetPAznT3ctx+adto41nFjD3g+7+1ZmFAbseODsnBGp1Yu+KHEyquitQ7qtNxrIJtbJnxpPkszXHWSi2JRoi7zC5oGsp/Q6W23fPm/tOh9Oz4+4LNtLz4E5wuUnZ/8cpuI3eJn7XixmQL+l16FqzuB43HyPQA0kq25twZXeTGUS0JqYjYMkBnOKuE+ioYQTHzz3vRuUwmlaAlwKHGVR2RVOfDmk2MPdDesM5N1eqdpefQfo+fX9BNLlAkQWnMlPbIWa8wA4OJRx3Yh4Rv7gYkStUDR/wyLRY2KC2SGkd3T4ce/a0xFGltFERzwkL0YFTCfZdG5hx08b3heySlm0s996HgPeijmjByEEXiklMQ5KJojQxTdtyiQnrRlE3Dj2XrNGrrBotPx5x2go4AA=","f03":"data:image/webp;base64,UklGRjYDAABXRUJQVlA4ICoDAAAwEQCdASpAAEAAPqFCnEmmI6KhLBgMAMAUCUAVBusgZ75dwIzTmf3y+fg0xjQiniAiNlimK//ZI8bXVtCx52t8kMFC/jnt2e2W/eSQIlwsIORCh2vvYfLeDXkTSz3W+POacd7wl240ozPuDtzVopBCnVJZDklmrBdvFW53nPWewVbWt+rWkqRZATApeqeksv6RgAD+/uwIkuf6/LqpiQVKh7hWzoGLUbnEPf7n+osb0t9/x0b6tA3ZMZ6VkAgw4yROYXqrCuNhRUbw5UT+H5mNHxIklxvtqW1A4pTT9RPFgU5kTYBcLCQHZh1jeki/KB1nCHhiofltTk2Jx4BryB9pjBbQ+5365+Md8HlRh35XkQKVOyuN++P1tcLn1f5xx1/xZ1fXAazWyv/iCyexHr7WyWRGwlI/5LGjytTFBQpt6oISVukBr30tSBahezMqqEy2qWopVEuxqorx8GyU9Y8BF66XZTVhxZlapHS9CKa1PcyRIfcS2jYzaY1DRhfZgQtQEMnQyS8JoOSpxshyK/ZVSvUssc2pe9cFLlXv7N5RFC9xoN0LLRe5J97bhHfMxqw0flb53RGfoXZFyhHA8FPU7/x/tz7cL1R9csPLXPbBqRLpQjb26gLOauqqjCrvDzueGkT/vF1hVb1DOOAYlYZ9C1Y9SRBGDS2tCyowa8GQM+g0hqwj8LcCNenADOZaqx98+gF+arGx6e9AN4MAPmVuuNVOceIiUeKljbeLEYJKG5Llj2KTpWZf5cJJ4B+qP2ox8V+xNCeU6F5ZmsYIdcEiV4crSeb76JSbs9bmqwIDqfiie6DSRL3O+eJIjulYCm5wgg6dJtCqHlX5bvKd9QyrJTtWtYYhDr16WBXwtit9Un2HktH2X3m60N03QvygEsZ3UcN3bzU4KtqxibrwUInctMD9PajLgoR0rPRhCrqFPTRMK+dSatDibgJ2axKcmHCh4b4qR7v6a5Llnqm6kXoTWJPQMphEOPc4X5bm1hBjHOPuxoHeDdh6ctRlfOine6hhrqnI5iOzWwL4TDNAYg04sp+OAZqzwAqGvnUrnLfhP60z/2IfCJHgAAA=","f04":"data:image/webp;base64,UklGRpQCAABXRUJQVlA4IIgCAABQDQCdASpAAEAAPp08m0iloyKhMBYN+LATiWcAz2c0thNpoWfUO8y0JWtpeFJY0+gXFo/6fhUi0kkUIH+X4Qh9Z2Of7Ho8I6UZKFxHlB/feiUgwsVgZj3rcxn45kUa9X0zBiba+95Z75aDssZhJZqaf43oAP799y8VoWMvsimsCaTHZzt9HPAtzifM2BdoFF9YZQxc0j/BcS+2gD/ZKuuHJjtHUaq/iDwTbxSOnUblaC0GRC8gVeriKFHIMia3keRCq5fzIw27UtFzsEANZG/DmI0p+iOqF+68d+vObIzodq9pkOpf881yZFI5Pc4xD/45of30Q++S9kmqkoPkTVEKRd2aRoKQec+9yTkJyM5XgzBrIVvHycUj1fGB2HAldh2/nnlCSs3x8Ua3uwKhRJNUpXsErq1z+/1l/uJGa4nEojynLepVpTFDNYQimBWPpGwlte7JQ76Ud45u+HrvaJ9n4QFGHKjBryA7tzHteE3+tMvNavAsoEx+o5GlNmZ5M9vXtxr7A1Ll7aianwfYbwiticNpJjh0q/RCPaeUTxPat09ZXQ1KGTiBHntc8/jk7ZWSsZGgDfneDSaRgOQJPCvGRKg6c0WvRw0phJIVh12pLWss0975u2fzy+sTvryPiZFcJQHB0kk4+W5VEqnWtSWuJ7/K7obToM/tYYHesMaeD/+CaG2XdHvqfevXayLkFUe5uEYvwSI9WUqhmB93L+hqVvNUgfwnGzyg9hT4bQD8D5IOq/JXcvv8skE2ytPfeGdapstS1YA0ohSANUthByT0ZKXoPNTEZrMSPgwAY5Lmga18lPgMP0fYKKsGzQp6rNQJl9vZv5A/gvtHax/esLI+9fdJ9xwAAAA=","f05":"data:image/webp;base64,UklGRv4DAABXRUJQVlA4IPIDAADwEACdASpAAEAAPqFCnkomI6KhqhmboMAUCWcAyAW9bBJrF5yZR24BriuPGJ6JGfp6q9g5VSJQFttZM2/TWGgf2UjE/jehgoH8kxz6aDsjKNiIw1yHmDvIUP3dRJD7p4OgAbvyubWYtu88FmHgm5tr/XgJNfNHrpn9ELwP7QqJqvvCYCuMG+x03saOx0mykIAA/v7CArt6+RpGUT1EQboAWTozWLE7p5zZK94Qii0hTnn5XV6kxV/v09LPUvM2bjMhwEIAtjKQf/6Q4yoGPHemXvILhBA45agtbhZWSpWLs6Y+pCCos3kne7vxc4Jjg2o4RWDvw8WDBtvdbAeyST/KLyG1Cg3G4PI52029gxA3gA7kwSjZ9yKG+H6Wi8EaOenpBSZbxgxEqT2vS6pPjRoq8W2rqJx5s/YcqFbOtF1qEDfRKI7qAPCgZPV6MWX69z2TnBg5qOF8IQ4nidI5gTNt7owZf7b7JPrCMYzIC1/v4DSDWco6t2HrH+9/LWaFS5/6kuei/YKuOeI5HEn8B4uvDaWH/tyjrxFIe6nzrTM8QPnPsHM+Q93L6TSNTgdzuTTaP6X3T/9A6gSThLr+aZiYOvHeHLmArcxVDq43wa2sr+VvymtE+agEk1rzytuaOByCa/psGWfpj0pHf2I3XjLxkv3nxfAwn2KVY3+od+Ji0DSQqo+28C898KDes+U5cJiSU3LGARBkItSVaZcO+3m57xBx1vqrl0maPgaateTve28dCgAX4LcINmVC9rcXLrWxHsLSP+H9hb9JBCo2ighd0JLdKRNf1sB2WBjkduEDfet2DX7FWWCHNRae1kBYmg+U86CN/9Vc86fpHe+ABlaWI5IuO5BilC+MM+dhuLJ59JwMsAgpq/pfuCe0XOLRdZsWB4Fn5O1i0MXYn16izn8yRJh1MLWUFZW8eWwwJlrURoe/Hq34+obJDvJN3mPzRqmrLJUgIOsAHSKKyPd8qkwO94cHvc+KgSOZ5pyBZKX04UE4+b2vItQA7bfRY3WgYvo9yv1RcqAMTpYq2jMjRkwZBvViRuOJAFrDfoIIGw7/4BXzV1znoiwG1kK7PiRcWFQfbgCp0m6fkQdm6eXyw5adsuMJm1k8qU0RRnqFuAQ3tDjZTzNPhOJI5tWJK275aOhy/w8Vwq+HH82I1dh4lkqTlC83i57sMxXqqLlrMr1mp/rdFUadFH46sdCe4/b/cM1hQOxfY5xADGTw4RDS5eJg0valdxSuR0zdjBvBvdUyedZLaj3b1lmvSByJmrmW0F3ZF/as4V1u1UO+vXp2bAm0f0jc+PdrWmFVgtrzxCxdkkbC4Iw2M/Pp1ymGZUm96AAAAA==","f06":"data:image/webp;base64,UklGRhwEAABXRUJQVlA4IBAEAADQEgCdASpAAEAAPpk6mEiloyIhMfqskLATCUAWZ3lgbxZueIbu3er5BQI7SPr9GTW1XnPNTTNzS/KB8VByP3I831g3dRuxA952/eEnMim2Si5UUvD812MDAkYkNuNpzMQJAb6VIE+295qauQd0J5/XKqGFare46VaAzjcn7Sbzm1C4XiEAFxCu0ZS3ITIeTtAJqedXxJOQxSZWlR4QEgAA/v8SAtnxDSS/mqBrAmmmbbNrcTzvBzCTQI+TR4CK77wKi2gBB7NI0q5jyN7FT//qf00ml5rRQnbiH+zbLpXdEIT4TOzwmnKk+YKJ+0OVJ/7tvkf5y/nrbg5VO1hH/SBb6xm4GJILYiKfRIslotVqgWpnqr8W2lhgkIla3OtfBZgyaSpZkk5Ay5S628lHaQBa169bJSAHcjpDL0Jw+unpocNA2H7cfbgACe67zapB/CYuKfRJSQkKEx0z9J2GXxxQ63nZM4QLzv7rLFGOkVtMB3OQcxwA55WEMD/y+bkztRWROt1mofPl32pUEQhVx5whtAmtqrsCzWSOKhvcFqb/7BVFpbs3usDRsk6cR7JIP5ptJrrmt5XMkzaxpnRjjG5os8ABc5lgU/sZJwxm7hLyQujNeJ0WuxicWUFRe2JpZGjA6+qEgzuX/1SqqTWsWi29f1OG6BZa673E1mgqbul0sWMQc8lRrJglolAZKQyxol5v49tJadeU/B6Kf4sIQqiwr9EUxSeO7dyOU9LqFs/irZeGzLOOFkInwmv72TGEiLspmGQnkJKzoDREEf6ZzJw/oQflqNhCzryxJx7H2Y7G9nMno7f9ulmbT6Q1vwf1REmW62Hhfpr8QQjRO89krVf2udchdGGMOgSTq8jld3gkai6AZncz9XGIYK1VCoNX4M3kldvMaAcrRezgyj+EZa3xm8tSkNbByEj64f1W+bTX8tUEDEuMsPtCWrgUAIDkjfzDa1FkyrzSrZpaEiKG7vkBrLXpQyhxcT2sI5oNgZwK3ehRUXNJiCwIyqZWWDzipeiBr0Hdkrdt4+y1ztwj3KvGKC82++icUSWtdbVr6gfBdAoTCRedGe9A8AZ/LD9YEBqfZlWBztKaC/48vYHVr8JCwQjpKFH1h1oZU+EuRie0MCOrVYHHpg/5ubtFWg4fbb2NBtjBqDLWfthgcBTkq5Zzyg2XS9kLhiBSxRjSBFrrj+BZruGdoKxK+cdiDcELV/L/8ygkNrqxIttJL7gRtfcwI8JJzQtCA6pD3RG6jXGrkTzYFiT8w4tk+kz6il70KhFntAHNB2BJoLn5iOilXc0CXjD1Ue29AJGPSGbs4XT4THRCunvO3nz3PuPQ6SVf61j9MaIh7+Ytugs1cp1BwI2itAcUKs03tPZUuCOniIAAAA==","a01":"data:image/webp;base64,UklGRoACAABXRUJQVlA4IHQCAADwDQCdASpAAEAAPqFEnEqmI6KhrBVbMMAUCWkA1NAyU6tQzNoVzV+sOvEf4PmXo/T8domYK1M+Nge2cq82Mnmd5nEou9kXyqxJYTfatcjABbgubzn/7YW944kAvXwPMUUZG2PXMkoUdqjZUGTe+gWI9HXE1rLdIgAA/vPBdRHpPg0E52kfb8IG3XCpEPGBM62LZ98Gwfb2z220dtXLCQ98JMXOJN7AcIDQCAabO+hNZI0wXxtF4uy6rs/hs3pOdt8yBmGDd9sv1OIvfJ939MhYEvbltE6Zdbd/++4/7Y/o99LfXbg7Hvbxyr83/fBbdSmo5trHvMsiPnlbWdvKwP4bJCgsPNWdvT57FLbYdLUDdhWSMJSRWHhk3Y0wLBy0p1EH4PBIkPjjfKG0rWi1OwqNi3kEKdR5OjRaM81TrWyr7lD7DICxXwiy4TfOzA7Ni7N1YaC30s6YnEm6MUVM5TZHmxM734Bl4ojnv9HTZZvUcKzkQP+dw2i1p9EF38HO9dw9aXg6zsW1KnEC53d0na6HSrROq6X2EBY/eIH9LHCopbPTeufxn8h2VQwfpg5Rh3UQMvXlH+C/dIXdnve2dVqEQvFJEOwckvQ81r2IQSYYydVexR2t7h6ldd9SBDEFlPuaMHck5vsVEsBbo0NB9z9y0in7Oj6ewNpkuOXy0lbBZkhzvW6sUu0jNXuZtlgaTDzGyUqZjz2m1zdjTXcqk7HYr7EaNwMR5JkEgeqggaOLhojggKzZSbTEmbrGwqBtJ749JG7Rem/apPNBhCYFrd6VESlms7/oWsgYBzxOTTCrKJv8NCL/Uqa0TPVXQ/SM9kcAAAAA","a02":"data:image/webp;base64,UklGRloDAABXRUJQVlA4IE4DAADQEACdASpAAEAAPqFEmkqmI6IhqhmdEMAUCWcAxVeyroX4Y+TYK8bedzLd0zbPyt+s7Vgc4ygjjlzs3vvQAif7gV1iZLye/ThHcxITxS55S0VmYOa+ms4Cyaec87vtFn6jNryabTPU27qsDyQVBeRr9dkHasnEazW7qu0YEWiypmKprw8gFe6AAKqVowXUAAD+/sIDpqRsYQUpW+CeEggNO/A0sbVquwM/MOQC2UNYa6ojLA1WlmL+tIW9/Abcf8/ld7Td+N2jA2FlB1blH8vsvWkcD7SDw1/t/cgeCpFmjFyvIURdeoquo5mFSJ5/WLrJ9xdQHYvZYdcY8B6WpIwtCXK2SLeO4PE4xmeAB3iwYKccCy/9xuL/bEOJE+1qCfF1Drs83R5BQRWFsS/ejudj+spL/0UykkdGVA6prWkS6qricNAlSs8zH7MyLKZzouyZQ5+SbzwfrDqfep6ii+MtwBax8diuaDXCaawYJlb84zTtYS6Y5fMF1W/LaBTRzT78HUlXKQ1vQ43HAZgvj+b7PsbE2Z7FSwHdjteF+CWK8LkCfHxQ0EXh/ZORCAiA5ES037k6H8wBqHMHo42Hr6PxzcfOhFfrkuTjx8J0g6cM0/xULzHzkUWw/XmLWn/zebRsczWH3ANf4bUDPaMIqPSa0sRqBe5LiRBRAlbkPNvsqeFi4zppQf46oZ+QxsD10YeaOU/u4ViHoe2WujvX1ufKpO3qH/o/h2+0+rGDN4t9ZqImnUVZ8rpYBvLuG5GXrErG/1XR9csDALq4d4tVfmTyuLQEyxKsViN37Sm+Tw7TZEk1ZpzabmKXd1DVgBYaMNcfwLdrL3r8JbW7blGNQxacsMd1D8mN38Te5Z6Q6yhp/bzwqqsEw2h4s7NDUfWkrbN70ll9kGMXwPny2HVXzDs+rV3DSZ6RYtu2WX35GJKidiSSzz77HMAbCbVTadt/klrbowyRrJMf8rSS/nYXM8WKyyLhe7Q6fZhLhnauBOhqxDH4VF3PM8v6/qE/RmVboJre7wCtf+1ec16hMGmaPcROjIbDb59hIP2gTlyZ2M9QZ3daBqUjmA1iDXzX6r9t49GCF9crfjO7SScH/y938rlg9iA6YIW3Ta0i71AAAAA=","a03":"data:image/webp;base64,UklGRoQDAABXRUJQVlA4IHgDAACQEQCdASpAAEAAPqFEnEqmI6KhqhM9EMAUCWIAvYucUaovoStvjzyreZ73fJsHWNWvZl2aeNopW/WdqweCjBKVTsuhEIFgNFm7VMbfCBQLJ1WKangr0iri5ziwGDScgATWRhvh+JK3X0mel1y4Ee3xD4HR4KM8u/3a+YAjHlArZ+qFMU/bPQZl+M6ae13uevBS45BPiAD+/sIPGEXr0rLsK5YEfZS4Y8GIlvH85ZwJpjZy1aNwpYlDeQoAO/CbOs83O6qk3viWyp3PLtJgARzL7GJC2N+lM0RS2dvKRoprosOKoOZUgPqBwvHUWVSIrEg5M+/fb2oNZehmv5Fyh23B8yNV+rX1hllbW/5O9qnknLDmborLYxJRkNCpuGH8UawFkoz2eOQMUvg+bXK5yhuM9ECu8ugwjkCTDLFpz0yhl5RIxoh+xVJuhZtzFkFhRBMbe2GjktViEItWCmZFxHAg/fhwHPXzbhUIQPz7Y0p+AtWshg/u2RdmEPC4XDuQuOweDcPfpoCghX0O2G5XmofQl8TTpQwNV3AhhiOSvDtxZK3djoEuh81jZct4nww1Ku62L2ez7pJH7U5+pnQF2SXNZS6/7rpwVJRUxIuuouU/n4VoHkCIZEwz490j099cjXWSoBZuW7poZIAHbznPrJ2orZMMyRm1RX5tIRl0eaXK9izbsuknx0v0aOFKmUDEaXIMGxVXwH1CmJ+RIPvj4ca5QBH2cIoJPg2FGjbsfweR+dFvv81e9giN8I318783+Hef2RQBVmOAp8duzFCmQqJwTDXJFIrkSXRI3e/hbabO8lnavXmxgjpzLF8pvIuXalVaDYo2uDauBkSjz+TFNLcGCif2J8DJ1KVWN4kgI9eiVUkoY5681Y2T52z0keczC9qyDo80bRQh/OelfzcmA7snb/Tw+whTd0FwTMa1GnG6wNrDF9BaKAThRzjlZR/jfQc2KqYfZSk+/kBW4izplYWHke0hVgaiKNcoWmtmoe+nbdTZofb4zPfk6Q9wgHlL5Kuv84PTq9xipq1nEnAeJftrIk8/fwrB9Ycbbc4Ip+9t6TNelUf2KseV09DyULqL8sx/H3SrmljAOoImEPKuE8Baug0RY2g/uGGfq8EgoV/hb120ZqSs7nna9qHZNLPWUcMGhlqAePM/PtwIFx3y/BMevC8bq7PwAAA=","a04":"data:image/webp;base64,UklGRswDAABXRUJQVlA4IMADAAAwEwCdASpAAEAAPqE8mEmmIyIhMfVckMAUCWYAuzMTCcyRbf2MI68N3b6c7RpyMCgagCRDMG6GOVW49/nxUHI/Zof4u3J4qe9Je6Lud+pwZkjHqpYZkIr5aPfVn5LUqQn6fL26bsKJ6+ixiysZV/aZ+M+BeNO6Cx/nisQuB1YLpw7wFCD6oO8thES1bI9Csl/fGeH6DS2kzTO6UH2xNRY7RwAA/v7sDbqWkAzLi7md8KSqj9ovTn1MTCXEDhpPnsefKuC5v3Odo6yFC9m5AMCrM/0jtCSeTCVfak2USxI7HIy/u6PXartOGg393S/osvMoqpO7XLWaKH/2vF7+0QXUD7QW0EhRC+kM6yGAJy9Fgi1KyJTr1uIzkQcTAFuKGhfDNyVfo7m2+VCHupza8nsptEwNPnUcDG6LpeXU/yo6HL8ATDB56Fccax5ljzDiQn0T1nSGeKRKNEni1RXq9lhcsqwoozY179Y4e8pBlC3381ypOniQupSPhnqdmcUuH3g0F3m6e5DIgyymwipuZAGH6d+lOR88M9I+DI59dHb62Cs7xWshX7g7D+fgHm0OW89J7ZGX7cqV3s1BUd/U+3kukIj6epZmD0y5E7+8xxqPeSs1UBi+nvH8GWhtBbk51MTETIwv5E0dWW/HivgcJLuTfsDETbiyhbzd8dvrZOsJaJtJkbMQ6Z8KBPkXS2lFY4RmtEGqLwPGZwt+2FxlJZwUExJOS6FNEV/zbm0TV9ojY/Uj0mBjA+4IIwGx9r6O6IEPR7mTpctUfogMY/j4z8YVQDxQpQKohXV9Jm6rmGgv/jCk7NbLbhHUpWmIsHBx1t7In9EGg7kvQ2VmrhD7fyZ4XcjHJoq7/vpAnLiPOGV5VLTwDqhvhpPSehduVUAXw90Wc0ZIo51mtFmZVgV9nW2R40+6DdhL0c1yTvtOwQ6mzjLTPjXoZGdXWqKG0vr2O6w6OZYwlnJfzKMKWUnQG6ztGLbqgo5XxoJWGw/7Ak+IySIZlT/gw1svu2xuJKa1PSqO86b5cm4kJFnDlDe1FcANd1JSUcEgb4kQ8xH4a9kRb/HJIoVOOVdugj3b+khezbjDKZ8L8lO82SxGPr5HXGoSPG6dRsbgp4FgwcyVESOMVVZhow/uo+iS5d1lW5sfUSxTXDkFpSasSf4mJYQWCXj4qbyuDdCEurFKs4J+HTWoRQhtJkvwycVaZdHKlc6o6QEVuH8QBCguEo9GyxStszAkoge3KInZXwKJ3v1BYxN80GC3gdze4y+YzqdZDzvMAAA=","a05":"data:image/webp;base64,UklGRjoDAABXRUJQVlA4IC4DAABQDwCdASpAAEAAPqFKn0smJCKhqhZpcMAUCUAZVWshIZWjeNNNay6aT5Lfqj2CUrtdFsOb92eDTz7XPcq/zuWHQhNIW0wBrmtlCGwrpwHN3jiASPpdi1NQa+budFnrcDlaBqElzrLeF43iu8+aLoi6ODG/2QRZB4yB4UhPhA1oMHrqcAD+/pOQfgtlkF8r1DkHtLC3VzXWJmkHmp3yCoNgrhNzcAfXjBQS566V+7NNGFPYWfCXg/6pxNhy9viJEsEixHyW+pip/9qI8zia9zGP0zJL9R8X8rL+sSskPDM8VYvLyiu+jSUdgxsIG9XMoVkF/y5xy0vb2X3oVGC9UN5cDs/c/LtKGeZph7HMLycRtUWvEp4fwLtdWnf3dkQKvZgtq4EJ405n7q62RMMmGya2TVCHtpZvIni+hnqjTzaN5cQjUHDoC0eo7Fcv9C7BOJvntawUHCVLsO6rzF0T9ljzWxQ1/gbGS79ycyohjBBPDA1Y1CERfVNTuLlzQ1uFdexrAMaSst2RnaTK++N7fLGLKITZC7QdG31p6gRpbf+WIIV1b7DkFP07yDRhR5GMvvE3W/Wk4Cb/LygBDQHUtTBcYMQOYCngbuYvOv23VH3PXfjSVnHe7+GX67wQ80jAWzQKeCQDI4R+brhy+Dl4s5HfRpet/eoyM2c8wKLTGifVGF3NIWFrljPwsMT3ghfqYobmNfJtFeg3CR1YjrRQiRuSZqU45t8mjA9bGkYhV9aXr4IymglhbmuBFvQ7yIsQuiSElMmSTzF4rh5VJBzfMg7EgJJzbDADRKWXAO7A1ZeA2dTzt6Ixeu+LJOCUIozL+9/6ABWWRlg63WpHVQ9NQh01fWLJdenXpFIZMd8Ih9wPjBqnPsWafx+Y2XSrN+mjHeiRKHVM0Hy43b5LTJoX4HK9XK6elqmXG3bEQ+0BVTmCUX2sEbFPVDhlsiCN2jLjwxMr2mLQ9M0lBYRtOQQ/rfbTxBeuIegmKMKxi+hFev1RdTh96UH6FVrXH/M2Y/sPxPphCZVDQMLGjdH00XBx3MssfjMp0rPzR16pPvA7UZdHexeUDZIboLc9SlWiAAAA","a06":"data:image/webp;base64,UklGRkADAABXRUJQVlA4IDQDAAAwEACdASpAAEAAPqFKnUsmJCKhpgsQwBQJYwDAW6GOyHrlX65MKjbfqRXbsg4BYb3c/T6VNZ0MrhxaUceoBtd7lamUL9t9o7dVJ1HqUkFNCCBlQgcZYacX8EgPAS8vEZZ+c6eUnNTCa3eTHm+1gDnZ/rgqcz7Qf+nGdy+1hIdhm/caB5Okji3eaQAA/v6Tj/Faemh4QdoEU9HFX+bs3oBFeM+lxUpqkjSwTDWQnGhZz0A06/cRxYZwqElh8+RU+ezX+WPq7d8fXaSnSMmv/zHGN2tqds81R7b0fOfcjWiofNLUnVdnKrQhFItihdeCSK1QUzguJfh4kqlQ+CyeskZ9Qe90YZvVYydx+K1LSr3D/uCM0DuCB52PHpV7M0saxrjQhA/1tqi33BgQ229i7StUw3sSByMHSs/D8YnHBdjW031o8h0SEZszOsuwJB44Gdx5e+2zIJeqh/pYot8Jc3AJtOPYn/Ls8SeV6ohEp9nhhc1wzGuQPcjJaURt7sNOb+2foH3Unyot00essk/9hJwI1CHJCXBbSUSlWYcTKs7ab6NTe7jYZSStk0Ca+o51vHpmsKiDT1eHVOH2vnKTS7zQl8jLbe9xraL/6L+xZDfw3sYJvKAZ8edM4Njd4GZniZPaBzLwOhYYnn4L6NXlMHiybB/lFZIffX+lbnI0jPktcylpbzc7WepBrhBJK7X+a5wSgKOy71/RQS+amuX/6Oy4x6PbtMRK8T9p6HC6mOn3New0/wwbv9SoPp/nP651d3hwWoDKvVdF6Q1TG3ITE0Gcv1XC8ByzHlUi5XOVUPZjgy9c2OSH7yH6N6WTsiJ/fEyowMNHcfXrMZhwgYwKLfAQ6m66XMKFQYBeTQwFde5bkIoec1bIcXvBqXjBtJgTeCDrTAzDthV0CDy0zk/ta5mWKKYVKUp/aoeVrdasNH/v/vX+ntSBl99T9DyhYxRxmyXxu/PCQtHbbV7hJl0bQJ3ltI+nmKbmPsPpCFWdaGjaC10M9Ss61IwRy6Soje77p3EdaX9/RXUjWa9Z3j0Ja5xwe62vEiUW3ABfvowKnM9zHcGItEkYfv5mMPHyoBn0Kkl4AAAA","o01":"data:image/webp;base64,UklGRrICAABXRUJQVlA4IKYCAABwDgCdASpAAEAAPpk+mUilo6KhMfcdsLATCWwAtvtaPtyRbe2sokOF/6YBSb3vhVXXPmWujJQow0ibb0N0Ave80SIkZMwL5a6Ycy7NZ/kAZoxWzPAAXJTwA4rKJ1JO+0Wb5y03G9BG5vPNlHQjdFhYvE/rRP4w1mk4DeAAAP73/DTMfnHwz4elWMLuNgKZx/v5G+bPoL9VZHzG34yTI7oAqBiN0zvHgROnm2NtaAkxwvoMfoYi2R0toj2eCrqM3v+p1iXk1SoUZqzNeCpHzoDcJOk8sX9xCDZOMf8oiE2f+f+E08dnFlsYa0IY3r/rwVM/9MA5aXerismFvK5yykFOdnpKwpcFOYM3IhFLTz/wJCkemHAL92VAb82eJgslZZbqsfvDVf+DIq+kxm673zq94CXT/YayleGP1MBOv9O5fNRmzpTTmczAze0seQzYnJYC6QFzq+hR8yLaGEPPVl8BuvzQ9bGbO0CKhdL6sdLhp+z54nUsro1lYQJBU7b5eWq6YEAhwsKedWLZPE8HCJMpoe4vdFlXTSQ/30WjgPUhswyPUKVgvEeyrO/unN5ulfHCtXiQnhKs/AzzlV2K77nr/IhTCPfhB1C1O5rek2DcFEHJs+2+/cGccKXlCYFP8oCL3qNtLJnoAdNjKQ56f4/e9EC9pD9pcMjsfR++B+J4c1HNI76sA9DAFGCJhTvu+GDn0UYXHfCFBPvi0sgcJeh5DYDZ8kqoR+a2P8BfACiXTUqSZ2eu1+PamNRRt2nBHkjcy1nb6P7BX3latCWQQ3N8k5/ZmFHIcHqSKkcsf6DybULFxNZeAAV3EaYCMVi7QFQNb05cWfI1bwLYIwY42UJ+75/bqLSCq1m39Bo1m01xlQLhubEgFLM28vuj1UC8ERHvEJwlAAA=","o02":"data:image/webp;base64,UklGRioDAABXRUJQVlA4IB4DAACQEACdASpAAEAAPqFGnkwmI6KiJBgMkMAUCWIAxq+mSxlpQev64DO4A57RyNrJrfkqtAXk7+EOlWaLUHzLQk4BlH88/s6ARAakYtiz5rFYTbwp+t3giWVm3Xmncc9xFcYWbaMpPhwQUS0BQ0ktcEMrYQwmj3CN7W6fG4Hm/zbcxrvh6WyAmZV87vqzMYAA/v56RA6VLkYaVDFVwE71IUE4Qbc3LJ03xzuNAjslCbZ0BwPx3WwdZ5Xp3IyA5JOlfD+AV9QHu1dft4O8NsrslaDdTlb0T5DfSHsbqZ4iiJRj/8A6T5vehfDAyrWf2rk/dbRJBBSftqPeVYfFykyEHqIO1XdpeTW2C2RQXvTlzHbP76nVHpYLByhhkXsoEKqWqak3W2AK/RjLaGFdT0YKwnvgcnM2zfDDDmwqh+BEnd/4/J9zPeS1Yyeps9KtnwIvKIDU5yf6aqbeeXpR0Nzev5PzWYY8Ep7jZKF99mYyKd2jcmMv/kIv1Ry1ROs6DbxzPGAGvimmAzx/tU5CC4dcZd8h3bN2kqRj0ezy3bfpdSzqumHK2x6Mwc1He+rxIn89buXIegY5eMYFOjQzzuj44X8aoZKqUiuOWnEI1ltZUhlKSDOkxxIXrw2Swh5FvcNDpxVZ5GTR/XV4FS60mrV4i4wYzGj4oecmpFR21auOkpR2I61AL0MjcikoCZvLldJ9iK2nlTahTGP7EBqqO5YcqF+dl8U6QRhFlg9ucEOfM8/kiNkpI7IrEpR8L/RSUojM8GalqCcFVKKr2klIvY9EIa/1HxlnGYG4J/w5zSMTXH+PT0yw6pJ95m2qLVT2HfxZ3z+3W6ASkSrWF5zjB6ETs63Kv0jzheXO7y/ls/vT+me7AX1Qj/JUgvnpdohpLFVS9/DsSWOyBrjUIalr2j7dCKqKcuHiCg+Uq895tph/acC5cDwZAz4RKUbJ7HzBK06Z2pFA91zfjjDjwSsipt2ISzD0V08XeZFKSH3FHlFeuLTInv5ZNvMHNaQsi4d3nGa+ZalCvtiCayfGfdN5FWuNWhhjKEpZdYnOtoj1NiEAAAA=","o03":"data:image/webp;base64,UklGRpgDAABXRUJQVlA4IIwDAACQDwCdASpAAEAAPqFGm0mmI6IhLhko4MAUCWMAucxDMAgSHd/SqtSXbxfNcFMwPgVpfZo//g8vr7VWbXRLsYZ395+hlVebJbXF6LEcY6Wvp2nlQCL8sPEdlzGFLxJB9N8Vaw8BQ/O9JOa2gDCmoEqN9Y9Z3A/HzfbnJvBdjAL7zNGuWNAAAP71XIS9JKb2G/n7lEqMXG/QldqjAlaSzEb+gzTarz7/NfEmPJ1DqXHomABarvY9e/TH/g88J/My2PR9Rm6PxyEO2IciXlmV8EB4u8hUt/4IYP97sER75VP3s6P7aER8wG/qZH7MypZMvhoNLckknURxtGE2CSBMVbns2lSE78eXqcV+OCnHNZNzjBbiPTKNYvrABllNyFHRopWiAfrAdGw6gHhSVmbL317/X81SRcUqgFLC5ckNus0d0tQOflxfYvr3fNiiJSWluvu0VhV4QSO7ccgbDkmF6GOIXelwMXkxbnxA+xnaglAANo5KHSElX3BIdAKeEEQveF9rhvlTaeUc15r3J2HrXxpqADpBVpwJdWLx2Qq0rTsiBQ8Qm9ddgjj8PhJ6x+Z7xh24YU+8slDvpRIcmyxtVS2o+iIALqL7rhkPQnDN1o/ElHEhJNrA3aPfrc+kXGFf9Ukj5pgQFL9q3VzeKnmpXXfrbT9Qiw/MNAzfdpIILgndQliHolZ3P3qe58Fy3CT0utrFe1Iv93XsGpz1OBdVQIXj7ZNc3P0FzWhs1YPqQ+Dlf1vjomKnK9KI+3Mrng00emJqVqtcagxyLb50+FDrCpzSm05ESoaFxsFwYUFmL5Xt9cHrEZPpMqmBKsMqbzFOw4mi3rfymc8TidthXxdRnrJjlrnvyWiMZVOb6y5LrHGZCqdfBYKAICLlH+At2QvYSOZSlJTr1acua+t0PIb0c2M7UwuwObwIzKjIMDsX7myMDO3eQQHBAoHyguSfbSIYf6O363s6rD2qItAwS2G3yamPbStSqEJJI7wzHLua4MjEPY5SUAsiG4HGXk5u3vsN0Yff/cBqYhLEdJMVEGYAHrVcfjtkR1Txz5zeWcsujmV8n6wTeGRYQ3iCRex7LT8izVfc+kjLgbc0dgtvP2qgL5CxHvRWAS7AwCwg35Bup3nr9BJ3gXQQt57AI92QvusNb5htmV8gx9NMralTwA06yWFVJvgEaqw951pLD4Bpm1qjNZS61HQOOsGNQAAAAA==","o04":"data:image/webp;base64,UklGRm4EAABXRUJQVlA4IGIEAACwEwCdASpAAEAAPqE8mUkmIyIhLhtscMAUCWQAuzN2UQalBVPgM+Ld128912Fid59wyriPr9G7Wz5ui1GaZ5TvrT2Bt1uas1uMDvyj95mwceUOtxZTnXP/uZR4MqN6b4Ujhi1GlDfGDbmJpnX+OYjeRtPDcPAQGw6BJquupabLe/ICMa8nh/IbJHXOLPSYMGkWbWagXGArqSLn8RxExx3ktYZ/fXzAAP7+7ALan/SyoPtz2fRDm9jTT9oOzCV9RRjn6W4XnunhdDO5lKytfj+6CHfE0ZLvJnuv8HMckZQBh0qXEeeH4IepABpul7rVIIxuPR/ITsasUqukQ5/7KFowFrKJ9BfqXv2ZGlMx/kWtjSGPoKMK9cOv+qUl3yoUuXs4uhTrCPhZn+09WtYfa/w+NlWzYyj3t5ce3v9PIugYvhp3FOzimv9f7sOXa1Tm6XYqpwCHczDZ3PmoQ/r8kzKZ4Q5K0jBSC1lQMcOvH5oA4IszsAi6+1mwGAJhIsg9T5HuiHUmQIAlNm2AteD5An8MKjnXEbYKZHugUR9Jq6r0f38IcLkU4HJFtUKNRCMksvDQKF3qsj2E6nCEsQxDE1q8naLUe+NZos91Befw8t8gPlHi3nBOWV8AwNfXIWt9E9CAlJbDPgoR+iFVDoOIPnb7Ws91jS8hIOkxHbEfLMcCNxA6WS2pyvhzcJPQxMkWDBl8ZXit7vCjphN7xnIrKQyzfCQuWObfxf2CCs0qKaWJVzzXr7wmQm3B8RnfrcyBN9IX1g31fM4itGPWOptq6OXa0AHR6tisaUvhJn15QEmppW6pDd8Vv+pjxFBC34qSqXAGGNmxhL3x6t6psJyQdISKOSJTne7RLMv9JuP+Vt99lH6LyC4CjNLqSD5jDoHKgAP/XesgQpydQLhAD1y3yn+3lIMLbtzuBdDWqg8DCiL5KRgO8kUJYgVRdYsuwSt1d3erHKiieCVE35iIPfSOfhJXP0ElGvOy8MNCX0tMealfiZnWZb69cwiplLmWE7sA5f0vXEDX2CLzI4uUbu5aTNi9QAf+8tOUX6ZqGZTPgNDExNJd6+1DJ/WuyDV5xaY+qtJXRmkb7xXwgr7fCkRCfNYBK/L3mlPHuiOxzaLYipqoa2K+UyR0E55l476P6liJD6HlpcKBuqoh4wXGa2CAbmEelil6aNlT9pzpGYpWa6ZYylAYy31XsrbBzgN3cXnXmZ5DhtRRMUFHZO0+kvEhTqDNIir5jGtmQaDP9p4cOTi/3WteWKMK2fnrFzcEl8XySv2Qp+ZNHJBZrmifhKc/5ymkNzVRDqKKbRXBj6MXk81s+NWXEm3Nx893C8p5PEQGQMOpDijFXic7+c8cP/cGqbBSxp5TWorVMsdNXsLiIpaioHHuAHD0EIHnR683CgSJsJFKmGBF9Rxd3hAn4dNEX3btZmveJB7Fns7to6EvonWIO/1+kttD8gluvbC5rCXrFeDeKmQF8QupuA8YC4LmOnNQAAA=","o05":"data:image/webp;base64,UklGRo4FAABXRUJQVlA4IIIFAACQFQCdASpAAEAAPok2lEilIyIhNf6OYKARCWYAuzOSAOG4B0dvdzwGm77y/PiOZH2JH6OE+oUYvZt2V377Ug8AdFPfQUAPEzz5fVfsD/r0zrgDIsNIaPN5vLVIPAVp+uqZ6Tv/S52GRas0vbk2OLz0n6milSclTomg/ugbbVm3c3vIbkanfdRfXWTjrTXtiaI0r+i8Fz9UcJAIx/rJqHW32rQ8OcbUjQchHvzjMSMOaOfTIZgAAP7/EgGsC5jueyF5mRmB3PxPUHzt8lU9FcM+awmoXsnLiik82h5cf3RhUJS+X3+aMmk6NTMVAi14smKKym+CtP/Efy2Kw1v4FziW2V289/CbahbBzPKI7Gql0dBDbfUDTlPXm/Yc67zRevlKfvEYjl9AFXVmPBOOlyFu+Re0by1RDWjn3im553SdB6tq70AdqdlP4bo6gfShPMETssPuQmNMw8lPIpQorbCL8D7rs0yFpc/gSed45ZosYPcCOOM74p/kgkmjtzCc4QfAesbw6uTf9/SZJufJtXsjSUOQmNb9fFb/Yf83s8xVdN+X0goOboml5U8fPn9Poo87GuhWrJVToYgTufVgebVDtRw9zHJJcK1kbwJxHT9479xdiw4AvBT+FCDFHX6KltkLEURvDarRHhY9H8QPmx3krGaqIm24Ifn+Xl9km2xbyTt0aMtHyTBRVcW8PsaC1SpvjNsjIRyTdZC/ydc4M0tYnARWzxSzkFM/WQUhlPilW8caXtIg0dCcGudWFNF5j9ElbS0EFxxEzJvmP1ILI81eolJ7WtjPBnG1jmkckjKvebbgTcQOCYfkHSi/H6JTLk6bd7Ve1EOT3P7VMMCptyZVtzhm5DPo2SDU30QAMxrqjdttBz3bd4WK0evIXyjYUJQfr3vJfzl/2KzK7tttM7fOhWJUQVua3dBZwWFDmOQxdpgPE8XJtgN16543VArg+h+f1mRqCs4RqKnzy5WZQig/63pqeDZGasKTOSCXabResBjnqeNf2lNLxK8CbhilqNmUGzoJPoX+0eNaJcbQ2vZt18tfaUnE9jV1Own2KezOUBPV0PTaanh9dYnVHPsapiDGz4UXqg1U9KVxdxUIYd2DrRfv4hKESZmgNYGx//4U3zomxHg0LiY+fWojzItaZ0/QYYNNzr0U1jPLrHVZgjOSo+eC2q2tqbCTD2b0VMJcqdZlbKi5kGlSNfFEPQhA29V8hIVIcGlR3Q/apgnoQVejaagKgpaqTzZAfEyuCzu9eehqFhDd0BgoimCJvTKZv/kQG01sF2e5s1csRgZIhpLEecrRv5IKPazmDyor03A/ric5yizNTTel0AHAXVp0pXcWjOTVPXw7JbM7uXrK/XMDWt7ZDUVXY53sE9PTXIj7VzTtkMwGgPBDtyq67ZR53x2I/zmtwr6D77aaX7DFsg2Tg3iZpCaOduBsI1eRzEx6tb/Le8UvmCwTNGlt4g/f1g6UvTwXgUbr0xwZSmbepIe6QMc8vloQvIdNuESPxBTPX6xwrUEf7DoeV6P79SvOVRbaLp0m7K00d4dzGmAbCk8sLP0QH+bhTRARYG9I8dLSgXy6zOR7v04vYafi0PbOoc/VPCEHxvxoY/Gbl6zqZUw8sTswVvcuqnAYdVLvcEAhUHZdlmI75eFlMnDabsjUXbzcTYr3k6W3PDWmpMtq2F0YTtqj5a/cjj0lm404duQq9sLZlW0bpP+kucmY4CdhLCDlkJa2FN6NjvOqKtJ8gIF7AXaNF0uKTe0wUnOhidI9K2n8r7Jb+GPPFj3HGXimowuxCGBJya5fbxVEs2mDJA8uP9obo3ItDj+66V72qXfnmXQbeSLCaxGl3vhxE7ztstnD71g8F6EldZJuvycrTgKEgAA=","o06":"data:image/webp;base64,UklGRsYDAABXRUJQVlA4ILoDAACQEQCdASpAAEAAPqFInUsmJCKhqBgKqMAUCWYAuGO9ka66Ron78Czbvc/gzZjC8b4TQzOPJ/9V+wanNBxe6CtRNf92Rs1IB03L/tf1Vwwf3qaGnSK3TWmfz0w5zvMXB6KucHR32JXdreK6962aAZM1MvqsxtEHxmt/SgLbL+xthRQ2he6YSJw4C3Wett/wrb5fxaWs4AD+/pOQinI5/t/vPn0qOCbir/cy3NaQOlsMVJfFD8uR+MbLxdlu/tTvT/g8tAAtyttrVMRkruJlqLy/X7PkohezlxioYYqbsO0T1Loe1apTHmde6s5TleRRgvvY+wZndu6+/kNjgz6qHEHKQOG+dKa96SJTZiGJiyUK/t8KwUSoGIG11dNiZPxzPzKOmxXX0TPjnx962v1uZS6LSdPaKMaiVjYfiY5dI7dpEGXv1oHOZ7a/sk+HY6XLa7Sit6uc1TG3trrr2zbGPF7f/P+ZX4LIOaX+AdiXOgseAV3c2V8S+g6vnEXPydwesb+f5Wdd/JljTr3bx4IiJGQOPtTJ75LKseF9Bc4cD14MlcYQ67ZS8j7li09HDJNEbP8Hvbshmrl/+ads6gJL9gq8ehkeZi0RnmP9BGEuEhAovle2/uu+ucIJktcsnQeVNAmDqItbaXm8RlHFpC4R+hjOHWov9OmNTTNdpKVUPdv+Uce0iYWrC69xTR0GTsdIx0ndC0OBIMGTugRAL9qHX/65GYZlT+Ij52QcMvaYnLS7fxSEfEjNj9UG7X0fzI5R5CB4K3fRfox3LiN25UTH3hES+HlY9xjJyqoV28FLdoJO+ww3NjS6azt8caAFdpPdAR5RpHOFfEfK2vL/+N3FnieNzF5nPr+Zerv8iRHYKAkBn/sWmYglBy4QiRvMO/S3bcDifeDfqgSEvOmNebEJyZomHxiTJbmUT67KuIt9txkZC+25iBybusB2xnDd3A5qrDesClVpqKdBhta//h2tDTvvfA2OXnPSF0JcIyKWslSvz6O3ZrE+PAjArOFHkYGUmlyJn3DzsrqoHE5oRfun9AaOrtHRxhMQZQKL4PSKvn3mHEQ5NKXAq1IVWlTBmJivRtrTtkAxfizSoHwjFpt8jz7B/NtP5yupHIVKu9O+HgCAONknXonYhJmtoeREdaz6APYtiwPbH6Cb0QWLl/SREyUloVMuOKu9wxc0L85w+7kGFGkdfT2RAUD5bdCLta+0nG2gDVtZM8g/fZjN663AjTNvHjMMjo6xfoOJkujIT/oBWidKCMdrHjExAAA="};
const AHAKO_COMMON_AVATAR_OPTIONS=[["","なし"],["m01","人物 男性 1"],["m02","人物 男性 2"],["m03","人物 男性 3"],["m04","人物 男性 4"],["m05","人物 男性 5"],["m06","人物 男性 6"],["f01","人物 女性 1"],["f02","人物 女性 2"],["f03","人物 女性 3"],["f04","人物 女性 4"],["f05","人物 女性 5"],["f06","人物 女性 6"],["a01","動物 1"],["a02","動物 2"],["a03","動物 3"],["a04","動物 4"],["a05","動物 5"],["a06","動物 6"],["o01","風景・モノ 1"],["o02","風景・モノ 2"],["o03","風景・モノ 3"],["o04","風景・モノ 4"],["o05","風景・モノ 5"],["o06","風景・モノ 6"]];
function ahakoAvatarSrc(id){return AHAKO_COMMON_AVATARS[String(id||'')]||'';}
(function (global) {
  'use strict';

  const DEFAULTS = Object.freeze({
    autoDelay: 2600,
    transitionMs: 420,
    maxStackVisible: 8,
    focusYMobile: 0.46,
    focusYDesktop: 0.48,
    baseGap: 34,
    dialogueGap: 56,
    largeGap: 48,
    soundGap: 60,
    whitespaceBreath: 9,
    startAt: 0,
    showHeader: true,
    showFooter: true,
    allowPrevious: true,
    keyboard: true,
    swipe: true,
    swipeThreshold: 44,
    endOnNextAction: true,
    uiLanguage: 'ja',
    historyAllScenes: false
  });

  const THEMES = new Set(['light', 'dark', 'cinema']);
  const TYPES = new Set(['text', 'dialogue', 'sound']);
  const SILENT_AUDIO_DATA_URI = 'data:audio/wav;base64,UklGRqQCAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYACAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function asNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function emit(host, name, detail) {
    host.dispatchEvent(new CustomEvent(name, { detail }));
  }

  // Chat bubbles already communicate "this is speech", so an outer Japanese
  // quotation pair is redundant. Keep the authored text untouched in .scene
  // and remove only a matching pair that wraps the ENTIRE displayed message.
  //
  // 「もしもし」        -> もしもし
  // 『聞こえる？』      -> 聞こえる？
  // 彼は「知らない」と言った。 -> unchanged
  function chatDisplayText(value) {
    const source = String(value ?? '');
    const match = source.match(/^(\s*)([「『])([\s\S]*)([」』])(\s*)$/);
    if (!match) return source;

    const open = match[2];
    const close = match[4];
    const matchingPair =
      (open === '「' && close === '」') ||
      (open === '『' && close === '』');

    if (!matchingPair) return source;
    return `${match[1]}${match[3]}${match[5]}`;
  }

  function assertSceneDocument(doc) {
    if (!doc || typeof doc !== 'object') throw new TypeError('Scene document must be an object.');
    if (doc.format !== 'scene-format') throw new Error('Unsupported document: format must be "scene-format".');
    if (doc.version !== '1.0') throw new Error(`Unsupported Scene Format version: ${doc.version ?? '(missing)'}`);
    if (!THEMES.has(doc.theme)) throw new Error(`Unsupported theme: ${doc.theme}`);
    if (!Array.isArray(doc.scenes) || doc.scenes.length === 0) throw new Error('Scene document must contain at least one scene.');

    const ids = new Set();
    doc.scenes.forEach((scene, index) => {
      if (!scene || typeof scene !== 'object') throw new Error(`Scene ${index + 1} must be an object.`);
      if (!scene.id || typeof scene.id !== 'string') throw new Error(`Scene ${index + 1} is missing a stable id.`);
      if (ids.has(scene.id)) throw new Error(`Duplicate scene id: ${scene.id}`);
      ids.add(scene.id);
      if (!TYPES.has(scene.type)) throw new Error(`Unsupported scene type at ${scene.id}: ${scene.type}`);
      if ((scene.type === 'text' || scene.type === 'dialogue') && typeof scene.text !== 'string') {
        throw new Error(`Scene ${scene.id} requires text.`);
      }
    });
    return doc;
  }

  class ScenePlayerCore {
    constructor(host, options = {}) {
      if (typeof host === 'string') host = document.querySelector(host);
      if (!(host instanceof HTMLElement)) throw new TypeError('ScenePlayerCore requires a host HTMLElement.');

      this.host = host;
      this.options = { ...DEFAULTS, ...options };
      this.document = null;
      this.index = -1;
      this.auto = false;
      this.ended = false;
      this.autoTimer = null;
      this.playbackTimelineStartedAt = 0;
      this.touchStartY = null;
      this.touchStartX = null;
      this.suppressNextClick = false;
      this.maxVisitedIndex = -1;
      this.historyOpen = false;
      this.historyScrollRaf = 0;
      this.historyMetrics = null;
      this.historyDepthItems = new Set();
      this.destroyed = false;
      this._bound = [];
      this.presentationTimers = [];
      // Chat read receipts use their own clock so they survive Scene advances.
      this.chatReadStartedAt = new Map();
      this.chatReadTimers = new Map();
      this.messageStateStartedAt = new Map();
      this.messageStateTimers = new Map();
      // Some legacy/imported Scenes do not have scene.id.  Read-receipt timing
      // must still be keyed per Scene; otherwise every id-less chat shares the
      // empty-string key and the delayed receipt only appears after navigation.
      this.chatReadSceneKeys = new WeakMap();
      this.chatReadSceneKeySeq = 0;
      this.layoutTimers = [];
      this.typingState = null;
      this.backgroundState = null;
      // Prefix cache for inherited background state. Without this, every Scene
      // advance rescans Scene 1..N, which becomes O(n²) over a long work.
      this._backgroundStateCache = [];
      this._backgroundStateCacheDocument = null;
      this.backgroundLayerIndex = 0;
      this.backgroundTimers = [];
      this.backgroundMotionEpoch = 0;
      this.audioUnlocked = false;
      // AudioContext unlock and story playback are separate states.
      // A restarted story must wait for the reader's next stage gesture even
      // when the AudioContext itself is already unlocked.
      this.audioPlaybackArmed = false;
      this.audioPending = [];
      // Ending one-shot is started from the final trusted pointer/touch gesture
      // on iOS. Keep a per-reading guard so finish() cannot fire it twice.
      this._endingAudioStarted = false;
      this.audioContext = null;
      this.audioGainNodes = new Map();
      this.audioSourceNodes = new Map();
      this.audioTimers = [];
      this.audioFadeFrames = new Map();
      this.audioState = { bgm: null, ambient: null };
      this.audioEls = {
        bgm: this._createAudioElement('bgm'),
        ambient: this._createAudioElement('ambient')
      };
      // Dedicated preloaded ending SE. It is played directly from the final
      // physical press on iPhone instead of relying on a later synthetic click.
      this.endingAudio = this._createAudioElement('ending');
      this.oneshots = new Set();
      // iOS/WebKit can reject media started later by AUTO timers even after the
      // reader unlocked audio earlier. Keep a small bank of reusable one-shot
      // elements and pre-authorize them from a trusted gesture. Reusing an
      // already-authorized media element lets future Scene SE / ending SE start
      // without requiring another tap.
      this.oneshotPool = Array.from({ length: 8 }, (_, i) => {
        const audio = this._createAudioElement(`oneshot-${i + 1}`);
        audio.__spInUse = false;
        audio.__spPriming = false;
        return audio;
      });
      this.muted = false;
      this._audioRenderMode = 'restore';

      // iOS V2.15: keep every real media source alive from the trusted START
      // gesture. Later Scene/AUTO transitions only seek/unmute an already-playing
      // HTMLMediaElement; they never ask Safari to authorize a new play().
      this._iosStableMediaBank = this._isIOSWebKit();
      this._iosAudioBank = new Map();
      this._iosBankPrimed = false;
      this._iosPersistentEntry = { bgm: null, ambient: null };
      // V2.13 AudioBuffer transport is intentionally disabled on iOS. Device
      // traces showed BufferSource.start() succeeding while hardware output stayed
      // silent, whereas native HTMLMediaElement output was audible.
      this._iosBufferAudio = false;
      this._bufferAudioCache = new Map();
      this._bufferAudioPromises = new Map();
      this._bufferPersistent = { bgm: null, ambient: null };
      this._bufferOneShots = new Set();

      this._buildShell();
      this._bindControls();
    }

    _buildShell() {
      this.host.classList.add('sp-core');
      this.host.innerHTML = `
        <div class="sp-background" aria-hidden="true">
          <div class="sp-bg-layer sp-bg-a"></div>
          <div class="sp-bg-layer sp-bg-b"></div>
        </div>
        <div class="sp-bg-textures" aria-hidden="true"></div>
        <div class="sp-bg-flash" aria-hidden="true"></div>
        <div class="sp-veil" aria-hidden="true"></div>
        <section class="sp-cover" hidden>
          <div class="sp-cover-bg" aria-hidden="true"></div>
          <div class="sp-cover-dim" aria-hidden="true"></div>
          <div class="sp-cover-copy">
            <div class="sp-cover-work-block">
              <img class="sp-cover-logo" alt="" hidden>
              <strong class="sp-cover-title"></strong>
              <span class="sp-cover-subtitle"></span>
              <small class="sp-cover-author"></small>
            </div>
            <div class="sp-cover-episode-block">
              <span class="sp-cover-episode"></span>
              <strong class="sp-cover-episode-title"></strong>
            </div>
          </div>
          <button class="sp-cover-start" type="button">はじめる</button>
        </section>
        <header class="sp-header">
          <button class="sp-button sp-prev" type="button" aria-label="Previous scene">‹</button>
          <div class="sp-meta">
            <span class="sp-author"></span>
            <strong class="sp-title"></strong>
          </div>
          <button class="sp-button sp-restart" type="button" aria-label="Restart">↺</button>
        </header>
        <main class="sp-stage" tabindex="0" aria-live="polite">
          <div class="sp-scenes"></div>
          <button class="sp-tap-hint" type="button" aria-label="Next scene">TAP</button>
        </main>
        <section class="sp-history" hidden aria-label="Past scenes">
          <div class="sp-history-top">
            <span class="sp-history-kicker">PAST</span>
            <span class="sp-history-help">過去Sceneをスクロール</span>
            <button class="sp-history-close" type="button" aria-label="Close history">×</button>
          </div>
          <div class="sp-history-scroll">
            <div class="sp-history-list"></div>
          </div>
        </section>
        <footer class="sp-footer">
          <div class="sp-progress-label"><span class="sp-progress-current">0</span><span> / </span><span class="sp-progress-total">0</span></div>
          <div class="sp-progress-track" aria-hidden="true"><div class="sp-progress-bar"></div></div>
          <button class="sp-auto" type="button" aria-pressed="false">AUTO</button>
        </footer>
        <section class="sp-ending" hidden>
          <div class="sp-ending-copy">
            <span class="sp-ending-kicker">END</span>
            <strong class="sp-ending-title">読了</strong>
            <p class="sp-ending-text"></p>
          </div>
          <div class="sp-ending-three">
            <button class="sp-ending-slot sp-ending-left" type="button" hidden><small></small><strong></strong></button>
            <button class="sp-ending-slot sp-ending-cover" type="button"><small>COVER</small><strong>表紙に戻る</strong></button>
            <button class="sp-ending-slot sp-ending-right" type="button" hidden><small></small><strong></strong></button>
          </div>
        </section>
      `;

      const q = (s) => this.host.querySelector(s);
      this.els = {
        cover: q('.sp-cover'),
        coverBg: q('.sp-cover-bg'),
        coverAuthor: q('.sp-cover-author'),
        coverLogo: q('.sp-cover-logo'),
        coverEpisode: q('.sp-cover-episode'),
        coverEpisodeTitle: q('.sp-cover-episode-title'),
        coverTitle: q('.sp-cover-title'),
        coverSubtitle: q('.sp-cover-subtitle'),
        coverStart: q('.sp-cover-start'),
        background: q('.sp-background'),
        bgA: q('.sp-bg-a'),
        bgB: q('.sp-bg-b'),
        bgTextures: q('.sp-bg-textures'),
        bgFlash: q('.sp-bg-flash'),
        veil: q('.sp-veil'),
        header: q('.sp-header'),
        footer: q('.sp-footer'),
        stage: q('.sp-stage'),
        scenes: q('.sp-scenes'),
        history: q('.sp-history'),
        historyScroll: q('.sp-history-scroll'),
        historyList: q('.sp-history-list'),
        historyClose: q('.sp-history-close'),
        title: q('.sp-title'),
        author: q('.sp-author'),
        prev: q('.sp-prev'),
        restart: q('.sp-restart'),
        auto: q('.sp-auto'),
        current: q('.sp-progress-current'),
        total: q('.sp-progress-total'),
        bar: q('.sp-progress-bar'),
        ending: q('.sp-ending'),
        endingTitle: q('.sp-ending-title'),
        endingCover: q('.sp-ending-cover'),
        endingLeft: q('.sp-ending-left'),
        endingRight: q('.sp-ending-right'),
        endingText: q('.sp-ending-text'),
        historyHelp: q('.sp-history-help'),
        historyClose: q('.sp-history-close'),
        tapHint: q('.sp-tap-hint')
      };

      this.host.classList.toggle('sp-no-header', !this.options.showHeader);
      this.host.classList.toggle('sp-no-footer', !this.options.showFooter);
      this.els.prev.hidden = !this.options.allowPrevious;
      this.setUILanguage(this.options.uiLanguage || 'ja');
    }

    _uiText(key) {
      const I = global.SceneStudioI18n;
      if (I && typeof I.t === 'function' && I.getLocale?.() === this.uiLanguage) return I.t(key);
      const fallback = {
        ja:{
          'player.previous':'過去Scene','player.restart':'最初から','player.history':'過去Sceneをスクロール','player.history.close':'履歴を閉じる',
          'player.ending.title':'読了','player.ending.text':'最後まで読みました。','player.ending.restart':'もう一度読む','player.ending.cover':'表紙に戻る'
        },
        en:{
          'player.previous':'Past Scenes','player.restart':'Restart','player.history':'Scroll past Scenes','player.history.close':'Close history',
          'player.ending.title':'Finished','player.ending.text':'You reached the end.','player.ending.restart':'Read again','player.ending.cover':'Back to cover'
        }
      };
      return fallback[this.uiLanguage]?.[key] || fallback.ja[key] || key;
    }

    setUILanguage(language='ja') {
      this.uiLanguage = language === 'en' ? 'en' : 'ja';
      if (!this.els) return this.uiLanguage;
      this.els.prev.setAttribute('aria-label', this._uiText('player.previous'));
      this.els.restart.setAttribute('aria-label', this._uiText('player.restart'));
      this.els.historyHelp.textContent = this._uiText('player.history');
      this.els.historyClose.setAttribute('aria-label', this._uiText('player.history.close'));
      this.els.endingText.textContent = this._uiText('player.ending.text');
      if(this.els.endingCover){
        const coverLabel = this.uiLanguage==='en' ? 'Back to cover' : '表紙に戻る';
        this.els.endingCover.innerHTML = `<small>COVER</small><strong>${coverLabel}</strong>`;
      }
      if(this.els.coverStart)this.els.coverStart.textContent = this.uiLanguage==='en' ? 'Start' : 'はじめる';
      if (!this.document) this.els.endingTitle.textContent = this._uiText('player.ending.title');
      return this.uiLanguage;
    }

    _on(el, event, fn, options) {
      el.addEventListener(event, fn, options);
      this._bound.push([el, event, fn, options]);
    }


    _bindControls() {
      // iOS/WebKit: the reading gesture unlocks Web Audio and arms playback.
      const pressPaper = () => {
        this.host.classList.remove('sp-paper-press');
        // Force a restart even on rapid taps.
        void this.host.offsetWidth;
        this.host.classList.add('sp-paper-press');
        this._layoutTimeout(() => this.host.classList.remove('sp-paper-press'), 115);
      };
      const armFromStageGesture = (e) => {
        pressPaper();
        this.unlockAudio(true);

        // V2.19 iPhone ending SE: Scene SE is proven reliable when its already-
        // running bank entry is opened directly from the physical pointerdown.
        // Do the same for the final SE BEFORE click -> finish() performs any
        // session/ending bookkeeping. finish() sees _endingAudioStarted and will
        // not fire it twice. Ignore controls/images so merely pressing UI on the
        // last Scene cannot trigger the ending sound.
        const target = e?.target;
        const isControl = target?.closest?.('button, a, .sp-scene-image.is-zoomable, .sp-scene-image.is-view-rec');
        const isEditableText = this.host.classList.contains('live-edit-enabled')
          && target?.closest?.('.sp-scene.is-active .sp-text, .sp-scene.is-active .sp-subtext');
        const atLastScene = !!this.document && !this.ended
          && this.index >= Math.max(0, (this.document.scenes?.length || 1) - 1);
        if (atLastScene && !isControl && !isEditableText) this._playEndingAudio();
      };
      if ('PointerEvent' in global) this._on(this.els.stage, 'pointerdown', armFromStageGesture, { passive: true });
      else this._on(this.els.stage, 'touchstart', armFromStageGesture, { passive: true });

      // Header back arrow returns to the cover. History remains available by downward gesture.
      this._on(this.els.prev, 'click', (e) => {
        e.stopPropagation();
        this.showCover({restart:true});
      });
      this._on(this.els.restart, 'click', (e) => { e.stopPropagation(); this.restart(); });
      if(this.els.coverStart)this._on(this.els.coverStart,'click',(e)=>{e.stopPropagation();this._beginFromCover(e);});
      if(this.els.endingCover)this._on(this.els.endingCover,'click',()=>this.showCover({restart:true}));
      this._on(this.els.auto, 'click', (e) => {
        e.stopPropagation();
        this.unlockAudio(true);
        // startAuto() owns the exact audio start/prime ordering.
        this.toggleAuto();
      });

      this._on(this.els.historyClose, 'click', (e) => {
        e.stopPropagation();
        this.closeHistory();
      });
      this._on(this.els.historyList, 'click', (e) => {
        const item = e.target.closest('.sp-history-item');
        if (!item) return;
        const nextIndex = Number(item.dataset.index);
        if (!Number.isInteger(nextIndex)) return;
        this.closeHistory({ keepVisualState: true });
        this.goToVisited(nextIndex);
        this.els.stage.focus({ preventScroll: true });
        // The swipe that opened History arms suppressNextClick so its synthetic
        // click cannot advance a Scene. Once the author explicitly selects a
        // History Scene, that protection is stale; clear it so the very next tap
        // advances normally.
        this.suppressNextClick = false;
      });
      this._on(this.els.historyScroll, 'scroll', () => this._scheduleHistoryDepth(), { passive: true });

      // V135 — TAP itself is the highest-priority Scene-advance control.
      // Its visible design stays unchanged; CSS expands only its invisible hit area.
      const isTapAdvanceSafeZone = (e) => !!e?.target?.closest?.('.sp-tap-hint');
      this._on(this.els.tapHint, 'click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (this.historyOpen || this.ended) return;
        this.unlockAudio(true);
        if(!this.typingState)emit(this.host,'sceneplayer:advanceintent',{index:this.index,scene:this.currentScene,at:performance.now()});
        this.next();
      });

      // V129 — Public Player can place visual/tap layers above the foreground image.
      // On iPhone Safari that means event.target is not always the .sp-scene-image
      // even though the user's finger is physically inside the image. Studio does
      // not have that shell-layer mismatch. Route the tap geometrically in capture
      // phase so VIEW POINT owns the gesture before generic Scene advance can run.
      this._on(this.els.stage, 'click', (e) => {
        if (this.historyOpen || e.defaultPrevented) return;
        // TAP safe zone always belongs to generic Scene advance, never image open.
        if (isTapAdvanceSafeZone(e)) return;
        const currentScene = this.document?.scenes?.[this.index];
        const sceneImage = currentScene?.presentation?.image;
        const pages = Array.isArray(sceneImage?.pages)
          ? sceneImage.pages.filter(page => page && typeof page.src === 'string' && page.src)
          : [];
        // Bundles may store the first page only in pages[0], with no legacy src
        // on the parent image. Resolve the same first page as _appendSceneImage.
        const firstImage = pages[0] || sceneImage;
        const hasViewPoints = pages.some(page => (page.viewPoints?.points || page.viewRec?.points || []).length) || (sceneImage?.viewPoints?.points || sceneImage?.viewRec?.points || []).length > 0;
        const action = sceneImage?.tapAction || (hasViewPoints ? 'viewRec' : pages.length > 1 ? 'fullscreen' : sceneImage?.fullscreen === false ? 'none' : 'fullscreen');
        if (!firstImage?.src || action === 'none') return;

        const activeScene = this.els.stage.querySelector('.sp-scene.is-active');
        const imageTarget = activeScene?.querySelector('.sp-scene-image');
        if (!imageTarget) return;
        // The media is rotated independently of its layout wrapper. Hit-test its
        // painted bounds so taps near the visible corners still open the image.
        const rect = (imageTarget.querySelector('.sp-scene-image-media') || imageTarget).getBoundingClientRect();
        const x = Number(e.clientX);
        const y = Number(e.clientY);
        if (!Number.isFinite(x) || !Number.isFinite(y)
            || x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;

        e.preventDefault();
        e.stopImmediatePropagation();
        // Reuse the wrapper's own handler to keep VIEW POINT and page bundles in sync.
        imageTarget._sceneImageOpen?.(e);
      }, true);

      this._on(this.els.stage, 'click', (e) => {
        if (e.target.closest('button')) return;

        // V133 — even when a large image physically overlaps this area, tapping
        // around the visible TAP hint must fall through to this handler's next().
        const inTapAdvanceSafeZone = isTapAdvanceSafeZone(e);

        // V128 — match Studio's proven V96 image routing exactly.
        // Never depend on decoration classes (`is-view-rec` / `is-zoomable`):
        // the Scene document is the source of truth for the tap action.
        const imageTarget = e.target.closest('.sp-scene-image');
        if (imageTarget && !inTapAdvanceSafeZone) {
          const currentScene = this.document?.scenes?.[this.index];
          const sceneImage = currentScene?.presentation?.image;
          const action = sceneImage?.tapAction || (sceneImage?.fullscreen === false ? 'none' : 'fullscreen');
          if (action !== 'none') {
            e.preventDefault();
            e.stopPropagation();
            if (sceneImage?.src) {
              if (action === 'viewRec') {
                // VIEW POINT owns this tap even if its authored point data is
                // empty/malformed; it must never become a generic Scene advance.
                if ((sceneImage.viewPoints?.points||sceneImage.viewRec?.points)?.length > 0) this._openSceneImageViewRec(sceneImage, imageTarget);
                else this._openSceneImage(sceneImage.src, sceneImage.alt || '', {sourceEl:imageTarget});
              } else if (action === 'fullscreen') {
                this._openSceneImage(sceneImage.src, sceneImage.alt || '', {sourceEl:imageTarget});
              }
            }
            return;
          }
        }

        if (this.host.classList.contains('live-edit-enabled')
            && e.target.closest('.sp-scene.is-active .sp-text, .sp-scene.is-active .sp-subtext')) {
          return;
        }
        if (this.suppressNextClick) {
          this.suppressNextClick = false;
          return;
        }
        // Keep the click itself as a second trusted audio-unlock point.
        // On iPhone, a one-shot started from pointerdown can reject asynchronously
        // (for example while the media element is still becoming ready). That
        // rejection is queued before the synthetic click; re-arming here lets the
        // same physical tap flush it instead of waiting for another user action.
        this.unlockAudio(true);
        if(!this.typingState)emit(this.host,'sceneplayer:advanceintent',{index:this.index,scene:this.currentScene,at:performance.now()});
        this.next();
      });

      if (this.options.keyboard) {
        // The cover's Start button becomes hidden after activation. On Safari,
        // keyboard focus can then fall off the stage, so listen at document
        // capture level while keeping input scoped to this visible Player.
        this._on(document, 'keydown', (e) => {
          if (this.destroyed || !this.document || this.ended || !this.els.cover?.hidden || this.historyOpen) return;
          if (!this.host.contains(e.target)) return;
          if (e.isComposing) return;
          if (e.target?.closest?.('button, a, input, textarea, select, [contenteditable="true"], .sp-image-viewer, .sp-scene-image-viewer')) return;
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            this.unlockAudio(true);
            if(!this.typingState)emit(this.host,'sceneplayer:advanceintent',{index:this.index,scene:this.currentScene,at:performance.now()});
            this.next();
          } else if (this.options.allowPrevious && (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'Backspace')) {
            e.preventDefault();
            e.stopPropagation();
            this.openHistory();
          }
        }, true);
      }

      // Desktop/trackpad: scrolling upward opens History. Downward scrolling keeps
      // the future discrete, so it never reveals an unread Scene.
      this._on(this.els.stage, 'wheel', (e) => {
        if (!this.options.allowPrevious || this.historyOpen) return;
        if (e.deltaY < -8) {
          e.preventDefault();
          this.openHistory({ wheelDelta: e.deltaY });
        }
      }, { passive: false });

      if (this.options.swipe) {
        this._on(this.els.stage, 'touchstart', (e) => {
          const t = e.changedTouches[0];
          this.touchStartY = t.clientY;
          this.touchStartX = t.clientX;
        }, { passive: true });

        this._on(this.els.stage, 'touchmove', (e) => {
          // Keep the page itself fixed. History has its own native momentum scroller.
          if (e.cancelable) e.preventDefault();
        }, { passive: false });

        this._on(this.els.stage, 'touchend', (e) => {
          if (this.touchStartY == null || this.touchStartX == null) return;
          const t = e.changedTouches[0];
          const dy = t.clientY - this.touchStartY;
          const dx = t.clientX - this.touchStartX;
          this.touchStartY = null;
          this.touchStartX = null;

          if (Math.max(Math.abs(dx), Math.abs(dy)) < this.options.swipeThreshold) return;
          this.suppressNextClick = true;

          // Pulling down/right enters History Scroll. Pushing up/left still advances
          // only one unread Scene at a time.
          if (Math.abs(dy) >= Math.abs(dx)) {
            if (dy > 0 && this.options.allowPrevious) this.openHistory({ dragDistance: dy });
            else if (dy < 0) { if(!this.typingState)emit(this.host,'sceneplayer:advanceintent',{index:this.index,scene:this.currentScene,at:performance.now()}); this.next(); }
          } else {
            if (dx > 0 && this.options.allowPrevious) this.openHistory({ dragDistance: dx });
            else { if(!this.typingState)emit(this.host,'sceneplayer:advanceintent',{index:this.index,scene:this.currentScene,at:performance.now()}); this.next(); }
          }
        }, { passive: true });
      }
    }

    _isExternalHttpAudio(src) {
      return /^https?:\/\//i.test(String(src || '').trim());
    }

    _isCorsWebAudioAsset(src) {
      const value = String(src || '').trim();
      if (!this._isExternalHttpAudio(value)) return false;
      try {
        const url = new URL(value, global.location?.href || undefined);
        // Scene Studio's R2 asset endpoint explicitly returns
        // Access-Control-Allow-Origin: *. These files can therefore be routed
        // through Web Audio safely, which is required for programmable volume
        // and fades on iPhone/iPad Safari (HTMLMediaElement.volume is effectively
        // system-controlled there). Keep arbitrary external URLs on the native
        // path so a third-party server without CORS never turns silent.
        return url.hostname === 'scene-studio-api.a-hako.workers.dev'
          && url.pathname.startsWith('/asset/');
      } catch (_) {
        return false;
      }
    }

    _prepareAudioTransport(audio, src) {
      if (!audio) return;
      const externalHttp = this._isExternalHttpAudio(src);
      const corsWebAudioAsset = this._isCorsWebAudioAsset(src);

      // Arbitrary absolute HTTP(S) audio stays on the native media path because
      // cross-origin MediaElementSource may be silenced without CORS. Assets
      // hosted by Scene Studio are served with permissive CORS, so use Web Audio
      // for them. This is especially important on iOS: native media playback does
      // not provide reliable script-controlled volume/fades, while GainNode does.
      audio.__spNativeOnly = externalHttp && !corsWebAudioAsset;
      audio.__spTransportSrc = src || '';
      if (corsWebAudioAsset) {
        try { audio.crossOrigin = 'anonymous'; } catch (_) {}
      } else if (audio.__spNativeOnly) {
        try { audio.crossOrigin = null; } catch (_) {}
      }
      emit(this.host, 'sceneplayer:audiotransport', {
        src: src || '',
        transport: audio.__spNativeOnly ? 'native-media' : 'web-audio',
        corsWebAudioAsset
      });
    }

    _isIOSWebKit() {
      try {
        const ua = navigator.userAgent || '';
        const platform = navigator.platform || '';
        const touchMac = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        return /iP(hone|ad|od)/.test(ua) || touchMac;
      } catch (_) { return false; }
    }

    _allDocumentAudioSources() {
      const out = new Set();
      const push = (commands) => {
        if (!Array.isArray(commands)) return;
        commands.forEach((c) => {
          if (!c?.src) return;
          const action = c.action || 'play';
          if (action === 'play' || action === 'start') out.add(String(c.src));
        });
      };
      (this.document?.scenes || []).forEach((scene) => push(scene?.audio));
      push(this.document?.ending?.audio);
      return Array.from(out);
    }

    _resolveCoreAudioSrc(src) {
      let value = String(src || '').trim();
      if (!value) return value;
      if (/^[A-Za-z0-9_-]{20,}$/.test(value) && !value.includes('.') && !value.includes('/')) {
        value = `https://scene-studio-api.a-hako.workers.dev/asset/${encodeURIComponent(value)}`;
      }
      return value;
    }

    _collectIOSMediaBankSpecs() {
      const specs = new Map();
      if (!this.document) return specs;
      const add = (channel, src) => {
        const value = this._resolveCoreAudioSrc(src);
        if (!value || !(channel === 'bgm' || channel === 'ambient' || channel === 'oneshot')) return;
        const key = `${channel}:${value}`;
        if (!specs.has(key)) specs.set(key, { key, channel, src: value });
      };
      const scan = (commands) => {
        if (!Array.isArray(commands)) return;
        commands.forEach((command) => {
          if (!command?.src) return;
          const action = command.action || 'play';
          if (!(action === 'play' || action === 'start')) return;
          add(command.channel, command.src);
        });
      };
      (this.document.scenes || []).forEach((scene) => scan(scene?.audio));
      // V2.18: Ending SE must use the SAME source-stable iOS one-shot bank as
      // Scene SE. Scene one-shots are now proven audible on iPhone, while the
      // old dedicated ending element could remain authorized yet still produce
      // silence at finish(). Resolve and prime the ending source with the rest
      // of the document so finish() only seeks/unmutes an already-running bank
      // element and never depends on a special late transport.
      scan(this.document?.ending?.audio);
      return specs;
    }

    _disposeIOSMediaBank() {
      if (!this._iosAudioBank) return;
      this._iosAudioBank.forEach((entry) => {
        if (!entry?.audio) return;
        if (entry.timer) clearTimeout(entry.timer);
        entry.timer = null;
        try { entry.audio.pause(); } catch (_) {}
        try { entry.sourceNode?.disconnect(); } catch (_) {}
        try { entry.gainNode?.disconnect(); } catch (_) {}
        entry.sourceNode = null; entry.gainNode = null; entry.useGain = false;
        try { entry.audio.removeAttribute('src'); entry.audio.load(); } catch (_) {}
      });
      this._iosAudioBank.clear();
      this._iosBankPrimed = false;
      this._iosPersistentEntry = { bgm: null, ambient: null };
    }

    _ensureIOSBankGain(entry) {
      if (!entry?.audio || !(entry.channel === 'bgm' || entry.channel === 'ambient')) return null;
      if (!this._isCorsWebAudioAsset(entry.src)) return null;
      if (entry.gainNode) return entry.gainNode;
      const ctx = this._ensureAudioContext();
      if (!ctx) return null;
      try {
        const source = ctx.createMediaElementSource(entry.audio);
        const gain = ctx.createGain();
        gain.gain.value = 0;
        source.connect(gain);
        gain.connect(ctx.destination);
        entry.sourceNode = source;
        entry.gainNode = gain;
        entry.useGain = true;
        try { entry.audio.volume = 1; } catch (_) {}
        emit(this.host, 'sceneplayer:iosmediabankgainready', { channel:entry.channel, src:entry.src, contextState:ctx.state });
        return gain;
      } catch (error) {
        entry.useGain = false;
        emit(this.host, 'sceneplayer:iosmediabankgainerror', { channel:entry.channel, src:entry.src, error });
        return null;
      }
    }

    _prepareIOSMediaBank() {
      if (!this._iosStableMediaBank || !this.document) return false;
      this._disposeIOSMediaBank();
      const specs = this._collectIOSMediaBankSpecs();
      specs.forEach((spec) => {
        const audio = this._createAudioElement(`ios-bank-${spec.channel}-${this._iosAudioBank.size + 1}`);
        // Never route this bank through createMediaElementSource on iOS. The
        // native media path is the only path that device tracing proved audible.
        audio.__spNativeOnly = true;
        audio.__spTransportSrc = spec.src;
        audio.__spLoadedSrc = spec.src;
        // Stable A-Hako BGM/Ambient may use a GainNode for real fades on iPhone,
        // where HTMLMediaElement.volume can be volume-locked. The source never
        // changes after this point, avoiding the old WebKit src-swap silence bug.
        if ((spec.channel === 'bgm' || spec.channel === 'ambient') && this._isCorsWebAudioAsset(spec.src)) {
          try { audio.crossOrigin = 'anonymous'; } catch (_) {}
        } else {
          try { audio.crossOrigin = null; } catch (_) {}
        }
        try { audio.preload = 'auto'; audio.playsInline = true; audio.loop = true; } catch (_) {}
        try { audio.muted = true; audio.volume = 0; } catch (_) {}
        audio.src = spec.src;
        try { audio.load(); } catch (_) {}
        this._iosAudioBank.set(spec.key, {
          ...spec,
          audio,
          active: false,
          targetVolume: 1,
          timer: null,
          primed: false,
          sourceNode: null,
          gainNode: null,
          useGain: false
        });
      });
      this._iosAudioBank.forEach((entry) => this._ensureIOSBankGain(entry));
      emit(this.host, 'sceneplayer:iosmediabankready', { count: this._iosAudioBank.size });
      return true;
    }

    _primeIOSMediaBank() {
      if (!this._iosStableMediaBank || !this._iosAudioBank?.size) return Promise.resolve(false);
      // IMPORTANT: every play() call is issued synchronously before the first
      // await/microtask, while START/AUTO still owns the trusted iOS gesture.
      const jobs = [];

      // Prime the dedicated ending SE FIRST. Large works can contain many audio
      // elements and iPhone may suspend later background media sessions. Keeping
      // the final SE on its own element and authorizing it before the Scene bank
      // makes manual and AUTO endings use the same already-running element.
      if (this.endingAudio?.src) {
        try {
          this.endingAudio.loop = true;
          this.endingAudio.muted = true;
          this.endingAudio.volume = 1;
          if (this.endingAudio.ended) this.endingAudio.currentTime = 0;
          const endingPrime = this.endingAudio.paused ? this.endingAudio.play() : null;
          if (endingPrime?.then) jobs.push(endingPrime.then(() => { this.endingAudio.__spPrimed = true; return true; }).catch((error) => { this.endingAudio.__spPrimed = false; emit(this.host,'sceneplayer:endingaudioprimeblocked',{src:this.endingAudio.src,error}); return false; }));
          else this.endingAudio.__spPrimed = !this.endingAudio.paused;
        } catch (error) { emit(this.host,'sceneplayer:endingaudioprimeblocked',{src:this.endingAudio.src,error}); }
      }
      this._iosAudioBank.forEach((entry) => {
        const audio = entry.audio;
        if (!audio) return;
        // START calls this before Scene 1 is rendered. AUTO may call it later
        // while Scene audio is already active; never mute/reset an active source.
        if (!entry.active) {
          try { audio.loop = true; audio.muted = true; audio.volume = entry.gainNode ? 1 : 0; } catch (_) {}
          if (entry.gainNode && this.audioContext) {
            try { entry.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime); } catch (_) { entry.gainNode.gain.value = 0; }
          }
          try { if (audio.ended) audio.currentTime = 0; } catch (_) {}
        }
        let result;
        try { result = audio.paused ? audio.play() : null; }
        catch (error) {
          emit(this.host, 'sceneplayer:iosmediabankblocked', { channel: entry.channel, src: entry.src, error });
          jobs.push(Promise.resolve(false));
          return;
        }
        if (result && typeof result.then === 'function') {
          jobs.push(result.then(() => {
            entry.primed = true;
            emit(this.host, 'sceneplayer:iosmediabankprimed', { channel: entry.channel, src: entry.src });
            return true;
          }).catch((error) => {
            entry.primed = false;
            emit(this.host, 'sceneplayer:iosmediabankblocked', { channel: entry.channel, src: entry.src, error });
            return false;
          }));
        } else {
          entry.primed = !audio.paused;
          jobs.push(Promise.resolve(entry.primed));
        }
      });
      this._iosBankPrimed = true;
      return Promise.allSettled(jobs).then(() => true);
    }

    _iosAudioSrcAliases(src) {
      const value = String(src || '').trim();
      const out = new Set();
      if (!value) return out;
      out.add(value);
      // Public Player normally hydrates bare R2 ids to /asset/<id>, but ending
      // audio can pass through a different shell/update path. Treat the raw id
      // and its public asset URL as the same source so the START-authorized bank
      // is always reused at finish().
      if (/^[A-Za-z0-9_-]{20,}$/.test(value) && !value.includes('.') && !value.includes('/')) {
        out.add(`https://scene-studio-api.a-hako.workers.dev/asset/${encodeURIComponent(value)}`);
      } else {
        try {
          const u = new URL(value, global.location?.href || undefined);
          const m = u.pathname.match(/\/asset\/([^/?#]+)$/);
          if (m?.[1]) out.add(decodeURIComponent(m[1]));
        } catch (_) {}
      }
      return out;
    }

    _iosBankEntry(channel, src) {
      if (!this._iosStableMediaBank) return null;
      const aliases = this._iosAudioSrcAliases(src);
      for (const alias of aliases) {
        const hit = this._iosAudioBank?.get(`${channel}:${alias}`);
        if (hit) return hit;
      }
      // Last-resort alias scan handles a bank built before/after public source
      // hydration without creating a new late-playing HTMLAudioElement.
      for (const entry of this._iosAudioBank?.values?.() || []) {
        if (entry?.channel !== channel) continue;
        const entryAliases = this._iosAudioSrcAliases(entry.src);
        for (const alias of aliases) if (entryAliases.has(alias)) return entry;
      }
      return null;
    }

    _setIOSBankEntryVolume(entry, target, duration = 0, done) {
      if (!entry?.audio) { if (done) done(); return; }
      const audio = entry.audio;
      const to = clamp(asNumber(target, entry.targetVolume ?? 1), 0, 1);
      entry.targetVolume = to;
      const ms = Math.max(0, asNumber(duration, 0));

      // iPhone media elements can be :volume-locked. For stable A-Hako
      // BGM/Ambient sources, route the already-authorized element through one
      // persistent GainNode. This restores authored 10s+ fades without changing
      // src or issuing a late play().
      const gain = entry.gainNode;
      const ctx = this.audioContext;
      if (gain && ctx) {
        const now = ctx.currentTime;
        const from = Number.isFinite(gain.gain.value) ? gain.gain.value : 0;
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(from, now);
          if (ms > 0) gain.gain.linearRampToValueAtTime(to, now + ms / 1000);
          else gain.gain.setValueAtTime(to, now);
        } catch (_) { gain.gain.value = to; }
        if (done) { if (ms > 0) this._audioTimeout(done, ms); else done(); }
        return;
      }

      const from = clamp(asNumber(audio.volume, 0), 0, 1);
      if (!ms) {
        try { audio.volume = to; } catch (_) {}
        if (done) done();
        return;
      }
      const started = performance.now();
      const step = (now) => {
        const t = clamp((now - started) / ms, 0, 1);
        try { audio.volume = from + (to - from) * t; } catch (_) {}
        if (t < 1) requestAnimationFrame(step);
        else if (done) done();
      };
      requestAnimationFrame(step);
    }

    _silenceIOSBankEntry(entry, reset = false) {
      if (!entry?.audio) return;
      if (entry.timer) { clearTimeout(entry.timer); entry.timer = null; }
      entry.active = false;
      if (entry.gainNode && this.audioContext) {
        try { entry.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime); entry.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime); } catch (_) { entry.gainNode.gain.value = 0; }
        try { entry.audio.volume = 1; entry.audio.muted = true; entry.audio.loop = true; } catch (_) {}
      } else {
        try { entry.audio.volume = 0; entry.audio.muted = true; entry.audio.loop = true; } catch (_) {}
      }
      if (reset) { try { entry.audio.currentTime = 0; } catch (_) {} }
    }

    _scheduleIOSOneShotSilence(entry, command, startAt) {
      if (!entry?.audio) return;
      if (entry.timer) clearTimeout(entry.timer);
      const schedule = () => {
        const audio = entry.audio;
        let ms = Math.max(0, asNumber(command.stopAfter, 0));
        if (!(ms > 0) && command.stopAt != null) {
          ms = Math.max(0, (Math.max(0, asNumber(command.stopAt, 0)) - startAt) * 1000);
        }
        if (!(ms > 0) && Number.isFinite(audio.duration) && audio.duration > startAt) {
          ms = Math.max(30, (audio.duration - startAt) * 1000 - 20);
        }
        // Keep the authorized element PLAYING forever; only silence it. Pausing
        // here would require a future Safari play() permission on a repeated SE.
        if (!(ms > 0)) ms = 1500;
        entry.timer = setTimeout(() => {
          entry.timer = null;
          this._silenceIOSBankEntry(entry, true);
        }, ms);
      };
      if (Number.isFinite(entry.audio.duration) && entry.audio.duration > 0) schedule();
      else entry.audio.addEventListener('loadedmetadata', schedule, { once: true });
    }

    _activateIOSBankEntry(entry, options = {}) {
      if (!entry?.audio) return false;
      const audio = entry.audio;
      const startAt = Math.max(0, asNumber(options.startAt, 0));
      const target = this.muted ? 0 : clamp(asNumber(options.target, 1), 0, 1);
      const fadeIn = Math.max(0, asNumber(options.fadeIn, 0));
      const seek = options.seek !== false;

      // V2.16: source-stable media is already PLAYING from START. The pop was
      // produced by seek + unmute happening in the same instant. Keep it muted
      // while seeking, establish zero gain first, then open the gate only after
      // WebKit has settled the seek. On current iOS versions volume ramps are
      // honoured when applied after this gate; on older versions this still
      // removes the hard seek transient even if volume is system-controlled.
      try { audio.loop = true; audio.muted = true; audio.volume = entry.gainNode ? 1 : 0; } catch (_) {}
      if (entry.gainNode && this.audioContext) {
        try { entry.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime); entry.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime); } catch (_) { entry.gainNode.gain.value = 0; }
      }
      if (seek) { try { audio.currentTime = startAt; } catch (_) {} }
      entry.active = true;
      entry.targetVolume = target;

      if (audio.paused) {
        try { const p = audio.play(); if (p?.catch) p.catch(() => {}); } catch (_) {}
      }

      let opened = false;
      const openGate = () => {
        if (opened || !entry.active) return;
        opened = true;
        try { audio.volume = entry.gainNode ? 1 : 0; audio.muted = this.muted; } catch (_) {}
        if (this.muted) return;
        if (fadeIn > 0) this._setIOSBankEntryVolume(entry, target, fadeIn);
        else this._setIOSBankEntryVolume(entry, target, 0);
      };

      if (seek && typeof audio.addEventListener === 'function') {
        const onSeeked = () => openGate();
        audio.addEventListener('seeked', onSeeked, { once: true });
        // Some cached MP3s do not emit seeked for a 0 -> 0 assignment. Keep a
        // short fallback, still long enough to avoid exposing the seek click.
        this._audioTimeout(openGate, 45);
      } else {
        this._audioTimeout(openGate, 16);
      }
      return true;
    }

    _playIOSBankOneShot(command) {
      const entry = this._iosBankEntry('oneshot', command?.src);
      if (!entry?.audio) return false;
      if (entry.timer) { clearTimeout(entry.timer); entry.timer = null; }
      const startAt = Math.max(0, asNumber(command.startAt, 0));
      const target = this.muted ? 0 : clamp(asNumber(command.volume, 1), 0, 1);
      const fadeIn = Math.max(0, asNumber(command.fadeIn, 0));
      this._activateIOSBankEntry(entry, { startAt, target, fadeIn, seek:true });
      this._scheduleIOSOneShotSilence(entry, command, startAt);
      emit(this.host, 'sceneplayer:audioplaystarted', { channel:'oneshot', role:command.role || 'se', action:'play', src:command.src, transport:'ios-live-media-bank' });
      emit(this.host, 'sceneplayer:oneshot', { command, transport:'ios-live-media-bank' });
      return true;
    }

    _startIOSBankPersistent(channel, command, reconstruct = false, forceSeek = false) {
      const entry = this._iosBankEntry(channel, command?.src);
      if (!entry?.audio) return false;
      const previous = this._iosPersistentEntry?.[channel];
      if (previous && previous !== entry) this._silenceIOSBankEntry(previous, false);
      const audio = entry.audio;
      const sameSrc = this.audioState[channel]?.src === command.src;
      const shouldSeek = forceSeek || !sameSrc || (!reconstruct && command.restart === true);
      const startAt = Math.max(0, asNumber(command.startAt, 0));
      const target = this.muted ? 0 : clamp(asNumber(command.volume, 1), 0, 1);
      const fadeIn = reconstruct ? 0 : Math.max(0, asNumber(command.fadeIn, 0));
      if (entry.timer) { clearTimeout(entry.timer); entry.timer = null; }
      entry.active = true;
      entry.targetVolume = target;
      this._iosPersistentEntry[channel] = entry;
      this._activateIOSBankEntry(entry, {
        startAt,
        target,
        fadeIn,
        seek: shouldSeek
      });
      this.audioState[channel] = {
        src: command.src,
        volume: target,
        loop: command.loop !== false,
        startAt,
        stopAt: command.stopAt == null ? null : Math.max(0, asNumber(command.stopAt, 0)),
        fadeOut: Math.max(0, asNumber(command.fadeOut, 0))
      };
      const stopAfter = Math.max(0, asNumber(command.stopAfter, 0));
      if (stopAfter > 0) entry.timer = setTimeout(() => this._stopPersistentChannel(channel, command.fadeOut || 0), stopAfter);
      else if (command.loop === false) {
        const schedule = () => {
          const remain = Math.max(0, (audio.duration - Math.max(0, audio.currentTime || startAt)) * 1000 - 20);
          if (remain > 0) entry.timer = setTimeout(() => this._stopPersistentChannel(channel, command.fadeOut || 0), remain);
        };
        if (Number.isFinite(audio.duration) && audio.duration > 0) schedule();
        else audio.addEventListener('loadedmetadata', schedule, { once:true });
      }
      emit(this.host, 'sceneplayer:audioplaystarted', { channel, action:'start', src:command.src, transport:'ios-live-media-bank' });
      emit(this.host, 'sceneplayer:audiostart', { channel, command, reconstruct, transport:'ios-live-media-bank' });
      return true;
    }

    _preloadAudioBuffer(src) {
      const key = String(src || '').trim();
      if (!key || !this._iosBufferAudio) return Promise.resolve(null);
      if (this._bufferAudioCache.has(key)) return Promise.resolve(this._bufferAudioCache.get(key));
      if (this._bufferAudioPromises.has(key)) return this._bufferAudioPromises.get(key);
      const ctx = this._ensureAudioContext();
      if (!ctx || typeof fetch !== 'function') return Promise.resolve(null);
      const job = fetch(key, { mode: 'cors', credentials: 'omit' })
        .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.arrayBuffer(); })
        .then((bytes) => new Promise((resolve, reject) => {
          try {
            const cloned = bytes.slice(0);
            const maybe = ctx.decodeAudioData(cloned, resolve, reject);
            if (maybe && typeof maybe.then === 'function') maybe.then(resolve).catch(reject);
          } catch (e) { reject(e); }
        }))
        .then((buffer) => {
          this._bufferAudioCache.set(key, buffer);
          emit(this.host, 'sceneplayer:audiobufferready', { src: key, duration: buffer?.duration || 0 });
          return buffer;
        })
        .catch((error) => {
          emit(this.host, 'sceneplayer:audiobuffererror', { src: key, error });
          return null;
        })
        .finally(() => this._bufferAudioPromises.delete(key));
      this._bufferAudioPromises.set(key, job);
      return job;
    }

    _preloadDocumentAudioBuffers() {
      if (!this._iosBufferAudio) return Promise.resolve(false);
      const sources = this._allDocumentAudioSources();
      if (!sources.length) return Promise.resolve(true);
      return Promise.allSettled(sources.map((src) => this._preloadAudioBuffer(src))).then(() => true);
    }

    _fadeBufferGain(gainNode, target, duration = 0) {
      const ctx = this.audioContext;
      if (!ctx || !gainNode) return;
      const t = ctx.currentTime;
      const current = Number.isFinite(gainNode.gain.value) ? gainNode.gain.value : 1;
      try {
        gainNode.gain.cancelScheduledValues(t);
        gainNode.gain.setValueAtTime(current, t);
        if (duration > 0) gainNode.gain.linearRampToValueAtTime(target, t + duration / 1000);
        else gainNode.gain.setValueAtTime(target, t);
      } catch (_) { gainNode.gain.value = target; }
    }

    _playBufferedOneShot(command) {
      if (!this._iosBufferAudio || !command?.src) return false;
      const buffer = this._bufferAudioCache.get(String(command.src));
      const ctx = this._ensureAudioContext();
      if (!buffer || !ctx || ctx.state !== 'running') return false;
      try {
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        source.buffer = buffer;
        source.loop = command.loop === true;
        const target = this.muted ? 0 : clamp(asNumber(command.volume, 1), 0, 1);
        const fadeIn = Math.max(0, asNumber(command.fadeIn, 0));
        gain.gain.value = fadeIn > 0 ? 0 : target;
        source.connect(gain); gain.connect(ctx.destination);
        const startAt = Math.max(0, asNumber(command.startAt, 0));
        source.start(0, Math.min(startAt, Math.max(0, buffer.duration - 0.001)));
        if (fadeIn > 0) this._fadeBufferGain(gain, target, fadeIn);
        const record = { source, gain, command };
        this._bufferOneShots.add(record);
        const cleanup = () => { this._bufferOneShots.delete(record); try { source.disconnect(); gain.disconnect(); } catch (_) {} };
        source.onended = cleanup;
        const stopAfter = Math.max(0, asNumber(command.stopAfter, 0));
        if (stopAfter > 0) this._audioTimeout(() => { try { source.stop(); } catch (_) {} }, stopAfter);
        if (command.stopAt != null) {
          const stopAt = Math.max(0, asNumber(command.stopAt, 0));
          const remain = Math.max(0, stopAt - startAt) * 1000;
          if (remain > 0) this._audioTimeout(() => { try { source.stop(); } catch (_) {} }, remain);
        }
        emit(this.host, 'sceneplayer:audioplaystarted', { channel:'oneshot', role:command.role || 'se', action:'play', src:command.src, transport:'audio-buffer' });
        emit(this.host, 'sceneplayer:oneshot', { command });
        return true;
      } catch (error) {
        emit(this.host, 'sceneplayer:audiobufferplayerror', { channel:'oneshot', src:command.src, error });
        return false;
      }
    }

    _stopBufferedPersistent(channel, fadeOut = 0) {
      const rec = this._bufferPersistent?.[channel];
      if (!rec) return false;
      const stop = () => {
        try { rec.source.stop(); } catch (_) {}
        try { rec.source.disconnect(); rec.gain.disconnect(); } catch (_) {}
        if (this._bufferPersistent[channel] === rec) this._bufferPersistent[channel] = null;
      };
      if (fadeOut > 0) { this._fadeBufferGain(rec.gain, 0, fadeOut); this._audioTimeout(stop, fadeOut + 20); }
      else stop();
      return true;
    }

    _startBufferedPersistent(channel, command, reconstruct = false, forceSeek = false) {
      if (!this._iosBufferAudio || !command?.src) return false;
      const buffer = this._bufferAudioCache.get(String(command.src));
      const ctx = this._ensureAudioContext();
      if (!buffer || !ctx || ctx.state !== 'running') return false;
      const existing = this._bufferPersistent[channel];
      const sameSrc = existing?.src === command.src;
      if (sameSrc && reconstruct && channel === 'bgm' && !forceSeek) return true;
      if (existing) this._stopBufferedPersistent(channel, 0);
      try {
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        source.buffer = buffer;
        source.loop = command.loop !== false;
        const target = this.muted ? 0 : clamp(asNumber(command.volume, 1), 0, 1);
        const fadeIn = reconstruct ? 0 : Math.max(0, asNumber(command.fadeIn, 0));
        gain.gain.value = fadeIn > 0 ? 0 : target;
        source.connect(gain); gain.connect(ctx.destination);
        const startAt = Math.max(0, asNumber(command.startAt, 0));
        source.start(0, Math.min(startAt, Math.max(0, buffer.duration - 0.001)));
        if (fadeIn > 0) this._fadeBufferGain(gain, target, fadeIn);
        const rec = { source, gain, src: command.src, volume: target, command };
        this._bufferPersistent[channel] = rec;
        source.onended = () => { if (this._bufferPersistent[channel] === rec) this._bufferPersistent[channel] = null; };
        const stopAfter = Math.max(0, asNumber(command.stopAfter, 0));
        if (stopAfter > 0) this._audioTimeout(() => this._stopBufferedPersistent(channel, command.fadeOut || 0), stopAfter);
        if (command.stopAt != null) {
          const stopAt = Math.max(0, asNumber(command.stopAt, 0));
          const remain = Math.max(0, stopAt - startAt) * 1000;
          if (remain > 0) this._audioTimeout(() => this._stopBufferedPersistent(channel, command.fadeOut || 0), remain);
        }
        this.audioState[channel] = { src:command.src, volume:target, loop:command.loop !== false, startAt, stopAt:command.stopAt ?? null, fadeOut:Math.max(0, asNumber(command.fadeOut,0)) };
        emit(this.host, 'sceneplayer:audioplaystarted', { channel, action:'start', src:command.src, transport:'audio-buffer' });
        emit(this.host, 'sceneplayer:audiostart', { channel, command, reconstruct, transport:'audio-buffer' });
        return true;
      } catch (error) {
        emit(this.host, 'sceneplayer:audiobufferplayerror', { channel, src:command.src, error });
        return false;
      }
    }

    _createAudioElement(channel) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.dataset.scenePlayerChannel = channel;
      audio.playsInline = true;
      audio.addEventListener('error', () => {
        emit(this.host, 'sceneplayer:audioerror', {
          channel,
          src: audio.currentSrc || audio.src || '',
          transport: audio.__spNativeOnly ? 'native-media' : 'web-audio',
          networkState: audio.networkState,
          readyState: audio.readyState,
          error: audio.error || null
        });
      });
      audio.addEventListener('canplay', () => {
        emit(this.host, 'sceneplayer:audioready', {
          channel,
          src: audio.currentSrc || audio.src || '',
          transport: audio.__spNativeOnly ? 'native-media' : 'web-audio'
        });
      });
      audio.addEventListener('timeupdate', () => {
        const state = this.audioState[channel];
        if (!state || state.stopAt == null) return;
        if (audio.currentTime >= state.stopAt) this._stopPersistentChannel(channel, state.fadeOut || 0);
      });
      return audio;
    }

    _disposeAudioElement(audio) {
      if (!audio) return;
      try { audio.pause(); } catch (_) {}

      const source = this.audioSourceNodes.get(audio);
      const gain = this.audioGainNodes.get(audio);
      try { source?.disconnect(); } catch (_) {}
      try { gain?.disconnect(); } catch (_) {}
      this.audioSourceNodes.delete(audio);
      this.audioGainNodes.delete(audio);

      try {
        audio.removeAttribute('src');
        audio.load();
      } catch (_) {}
    }

    _replacePersistentAudioElement(channel, nativeOnly) {
      const oldAudio = this.audioEls[channel];
      const previousVolume = this._getAudioVolume(oldAudio);

      this._disposeAudioElement(oldAudio);

      const fresh = this._createAudioElement(channel);
      fresh.__spNativeOnly = Boolean(nativeOnly);
      fresh.__spGainValue = previousVolume;
      this.audioEls[channel] = fresh;

      emit(this.host, 'sceneplayer:audiotransportreset', {
        channel,
        from: oldAudio?.__spNativeOnly ? 'native-media' : 'web-audio',
        to: nativeOnly ? 'native-media' : 'web-audio'
      });

      return fresh;
    }

    _ensureAudioContext() {
      if (this.audioContext) return this.audioContext;
      const AudioContextClass = global.AudioContext || global.webkitAudioContext;
      if (!AudioContextClass) return null;
      try {
        this.audioContext = new AudioContextClass();
      } catch (_) {
        this.audioContext = null;
      }
      return this.audioContext;
    }

    _ensureAudioNode(audio) {
      if (!audio) return null;
      if (audio.__spNativeOnly) return null;
      if (this.audioGainNodes.has(audio)) return this.audioGainNodes.get(audio);
      const ctx = this._ensureAudioContext();
      // Important on first iPhone playback: do not route a media element into
      // a suspended AudioContext. WebKit can report media playback as active
      // while the graph is still silent. Let the media element start first,
      // then attach it once the context is actually running.
      if (!ctx || ctx.state !== 'running') return null;
      try {
        const source = ctx.createMediaElementSource(audio);
        const gain = ctx.createGain();
        gain.gain.value = Number.isFinite(audio.__spGainValue) ? audio.__spGainValue : 1;
        source.connect(gain);
        gain.connect(ctx.destination);
        this.audioSourceNodes.set(audio, source);
        this.audioGainNodes.set(audio, gain);
        // Once routed through Web Audio, leave HTMLMediaElement volume at unity.
        // GainNode becomes the single source of truth for volume/fades.
        try { audio.volume = 1; } catch (_) {}
        return gain;
      } catch (error) {
        emit(this.host, 'sceneplayer:audiographerror', { error });
        return null;
      }
    }

    _setAudioVolume(audio, value) {
      const target = clamp(asNumber(value, 1), 0, 1);
      audio.__spGainValue = target;
      const gain = this._ensureAudioNode(audio);
      if (gain && this.audioContext) {
        try { gain.gain.setValueAtTime(target, this.audioContext.currentTime); } catch (_) { gain.gain.value = target; }
      } else {
        // Native-media transport is deliberate for external HTTP(S) audio.
        // On iOS the system may own final hardware volume, but playback remains
        // audible instead of being silenced by a cross-origin Web Audio graph.
        try { audio.volume = target; } catch (_) {}
      }
    }

    _getAudioVolume(audio) {
      if (Number.isFinite(audio?.__spGainValue)) return audio.__spGainValue;
      return clamp(asNumber(audio?.volume, 1), 0, 1);
    }

    _primeAudioContext(ctx) {
      if (!ctx) return;
      try {
        // iOS/WebKit can report a resumed context while the output path is not
        // yet producing audio. Starting a one-sample silent buffer inside the
        // same user gesture explicitly primes the Web Audio render path.
        const buffer = ctx.createBuffer(1, 1, Math.max(8000, ctx.sampleRate || 44100));
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (_) {}
    }

    _flushPendingAudio() {
      if (!this.audioUnlocked || !this.audioPlaybackArmed) return;
      const pending = this.audioPending.splice(0);
      pending.forEach((fn) => {
        try { fn(); } catch (_) {}
      });
    }

    unlockAudio(armPlayback = false) {
      const ctx = this._ensureAudioContext();
      this.audioUnlocked = true;
      if (armPlayback) this.audioPlaybackArmed = true;

      // Keep the call to resume inside the trusted reading gesture, but do not
      // pre-connect media elements while the context is suspended.
      this._primeAudioContext(ctx);
      if (ctx && ctx.state === 'suspended') {
        try {
          const resumed = ctx.resume();
          if (resumed && typeof resumed.then === 'function') {
            resumed.then(() => {
              // Do NOT pre-connect idle BGM/Ambient elements here.
              // iOS/WebKit can successfully resolve media.play() after a later
              // src swap while producing silence if that element was already
              // bound to createMediaElementSource(). Let the REAL source start
              // first in _safePlay(), then attach its GainNode there.
            }).catch(() => {});
          }
        } catch (_) {}
      }

      // Flush now so HTMLMediaElement.play() itself is still called from the
      // user's gesture. _safePlay handles delayed graph attachment.
      this._flushPendingAudio();

      emit(this.host, 'sceneplayer:audiounlock', {
        webAudio: !!ctx,
        armed: this.audioPlaybackArmed,
        contextState: ctx?.state || 'unavailable'
      });
      return true;
    }

    _queueAudio(fn) {
      if (this.audioUnlocked && this.audioPlaybackArmed) return fn();
      this.audioPending.push(fn);
      emit(this.host, 'sceneplayer:audiopending', { count: this.audioPending.length });
      return false;
    }

    _clearAudioTimers() {
      this.audioTimers.forEach((timer) => clearTimeout(timer));
      this.audioTimers.length = 0;
      this.audioFadeFrames.forEach((frame) => cancelAnimationFrame(frame));
      this.audioFadeFrames.clear();
    }

    _audioTimeout(fn, delay) {
      const timer = setTimeout(() => {
        const i = this.audioTimers.indexOf(timer);
        if (i >= 0) this.audioTimers.splice(i, 1);
        fn();
      }, Math.max(0, delay));
      this.audioTimers.push(timer);
      return timer;
    }

    _fadeVolume(audio, target, duration, key, done) {
      target = clamp(asNumber(target, this._getAudioVolume(audio)), 0, 1);
      duration = Math.max(0, asNumber(duration, 0));
      const previous = this.audioFadeFrames.get(key);
      if (previous) cancelAnimationFrame(previous);

      const gain = this._ensureAudioNode(audio);
      const ctx = this.audioContext;
      const from = this._getAudioVolume(audio);
      audio.__spGainValue = target;

      // Web Audio path: reliable gain automation on iOS/WebKit.
      if (gain && ctx) {
        try {
          const now = ctx.currentTime;
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(from, now);
          if (!duration) {
            gain.gain.setValueAtTime(target, now);
            if (done) done();
          } else {
            gain.gain.linearRampToValueAtTime(target, now + duration / 1000);
            this._audioTimeout(() => { if (done) done(); }, duration);
          }
          return;
        } catch (_) {
          // Fall through to HTMLMediaElement/rAF fallback.
        }
      }

      if (!duration) {
        try { audio.volume = target; } catch (_) {}
        this.audioFadeFrames.delete(key);
        if (done) done();
        return;
      }
      const start = performance.now();
      const step = (now) => {
        const t = clamp((now - start) / duration, 0, 1);
        const value = from + (target - from) * t;
        try { audio.volume = value; } catch (_) {}
        if (t < 1) this.audioFadeFrames.set(key, requestAnimationFrame(step));
        else {
          this.audioFadeFrames.delete(key);
          if (done) done();
        }
      };
      this.audioFadeFrames.set(key, requestAnimationFrame(step));
    }

    _safePlay(audio, detail, onStarted) {
      const play = () => {
        const ctx = this._ensureAudioContext();
        let startedCallbackDone = false;
        const finishStart = () => {
          if (startedCallbackDone) return;
          startedCallbackDone = true;
          const attach = () => {
            if (!audio.__spNativeOnly) {
              const gain = this._ensureAudioNode(audio);
              if (gain) this._setAudioVolume(audio, this._getAudioVolume(audio));
            } else {
              try { audio.volume = this._getAudioVolume(audio); } catch (_) {}
            }
            try { audio.muted = false; } catch (_) {}
            if (onStarted) onStarted();
          };
          if (audio.__spNativeOnly || !ctx || ctx.state === 'running') attach();
          else {
            try {
              const r = ctx.resume();
              if (r && typeof r.then === 'function') r.then(attach).catch(attach);
              else attach();
            } catch (_) { attach(); }
          }
        };

        // AUTO priming leaves the element muted on purpose. Real playback must
        // unmute synchronously before play(), otherwise WebKit may report
        // "started" while the authorized element remains inaudible.
        try { audio.muted = false; } catch (_) {}
        // On first iPhone playback, call media.play() before connecting the
        // element to a suspended Web Audio graph. This preserves the trusted
        // user activation that WebKit requires for media start.
        if (!audio.__spNativeOnly && ctx && ctx.state !== 'running' && !this.audioGainNodes.has(audio)) {
          try { audio.muted = true; } catch (_) {}
        } else if (audio.__spNativeOnly) {
          try { audio.muted = false; } catch (_) {}
        }
        let promise;
        try { promise = audio.play(); }
        catch (error) {
          // Manual reading can retry a blocked sound on the next trusted tap.
          // AUTO has no future trusted taps, so globally disarming playback here
          // would make every BGM / Ambient / SE after the first rejection silent.
          // In AUTO, skip only the blocked item and leave the transport armed so
          // later commands still get a chance to play.
          const retryable = detail?.channel !== 'oneshot' && detail?.channel !== 'ending';
          if (!this.auto && retryable) {
            this.audioPlaybackArmed = false;
            this.audioPending.push(() => this._safePlay(audio, detail, onStarted));
          }
          // SE is an event. Never replay a blocked Scene SE on the NEXT tap;
          // doing so made Scene 1 SE overlap Scene 2's own SE.
          emit(this.host, 'sceneplayer:audioblocked', { ...detail, error, auto: this.auto });
          return;
        }
        if (promise && typeof promise.then === 'function') {
          promise.then(finishStart).catch((error) => {
            const retryable = detail?.channel !== 'oneshot' && detail?.channel !== 'ending';
            if (!this.auto && retryable) {
              this.audioPlaybackArmed = false;
              this.audioPending.push(() => this._safePlay(audio, detail, onStarted));
            }
            emit(this.host, 'sceneplayer:audioblocked', { ...detail, error, auto: this.auto });
          });
        } else finishStart();
      };
      this._queueAudio(play);
    }


    _collectFutureAudioSources() {
      const sources = { bgm: '', ambient: '', oneshot: [] };
      if (!this.document) return sources;
      const seen = new Set();
      const scenes = Array.isArray(this.document.scenes) ? this.document.scenes : [];
      for (let i = Math.max(0, this.index); i < scenes.length; i += 1) {
        const commands = Array.isArray(scenes[i]?.audio) ? scenes[i].audio : [];
        for (const command of commands) {
          if (!command?.src) continue;
          const action = command.action || 'play';
          if (!(action === 'play' || action === 'start')) continue;
          if (command.channel === 'bgm' && !sources.bgm) sources.bgm = command.src;
          else if (command.channel === 'ambient' && !sources.ambient) sources.ambient = command.src;
          else if (command.channel === 'oneshot' && !seen.has(command.src)) {
            seen.add(command.src);
            sources.oneshot.push(command.src);
          }
        }
      }
      const ending = Array.isArray(this.document?.ending?.audio) ? this.document.ending.audio : [];
      for (const command of ending) {
        if (command?.channel !== 'oneshot' || !command.src || seen.has(command.src)) continue;
        const action = command.action || 'play';
        if (!(action === 'play' || action === 'start')) continue;
        seen.add(command.src);
        sources.oneshot.push(command.src);
      }
      return sources;
    }

    _primeMediaElement(audio, src = '') {
      if (!audio || audio.__spInUse || audio.__spPriming || !audio.paused) return Promise.resolve(true);

      // AUTO on iPhone needs each future HTMLMediaElement to have been started
      // once by the AUTO button gesture. Prime the ACTUAL source on the SAME
      // stable element while muted, await the play(), then pause it BEFORE any
      // AUTO timer is scheduled. Because we wait for every prime to settle,
      // no delayed pause can race with the real Scene playback.
      const targetSrc = String(src || audio.__spLoadedSrc || '').trim();
      if (!targetSrc) return Promise.resolve(true);
      const token = (audio.__spPrimeToken || 0) + 1;
      audio.__spPrimeToken = token;
      audio.__spPriming = true;
      audio.__spAuthorized = false;
      try {
        audio.pause();
        audio.loop = false;
        // Keep priming off the Web Audio graph. The real source is connected
        // only after its audible play() succeeds.
        if (this.audioSourceNodes.has(audio) || this.audioGainNodes.has(audio)) {
          // A graph-bound element is source-stable; never repurpose it.
          audio.__spPriming = false;
          return Promise.resolve(audio.__spLoadedSrc === targetSrc);
        }
        this._prepareAudioTransport(audio, targetSrc);
        if (audio.src !== targetSrc && audio.currentSrc !== targetSrc) {
          audio.src = targetSrc;
          try { audio.load(); } catch (_) {}
        }
        audio.__spLoadedSrc = targetSrc;
        try { audio.muted = true; } catch (_) {}
        const promise = audio.play();
        return Promise.resolve(promise).then(() => {
          if (audio.__spPrimeToken !== token) return true;
          try { audio.pause(); } catch (_) {}
          try { audio.currentTime = 0; } catch (_) {}
          audio.__spPriming = false;
          audio.__spAuthorized = true;
          emit(this.host, 'sceneplayer:audioprimed', { src: targetSrc, channel: audio.dataset.scenePlayerChannel || '' });
          return true;
        }).catch((error) => {
          if (audio.__spPrimeToken === token) audio.__spPriming = false;
          emit(this.host, 'sceneplayer:audioprimeblocked', { src: targetSrc, channel: audio.dataset.scenePlayerChannel || '', error });
          return false;
        });
      } catch (error) {
        if (audio.__spPrimeToken === token) audio.__spPriming = false;
        emit(this.host, 'sceneplayer:audioprimeblocked', { src: targetSrc, channel: audio.dataset.scenePlayerChannel || '', error });
        return Promise.resolve(false);
      }
    }

    _oneShotElementForSource(src) {
      const targetSrc = String(src || '').trim();
      if (!targetSrc) return null;
      // Once an Audio element is routed through MediaElementSource on iOS,
      // changing its src can yield play()=resolved but SILENT audio. Pin each
      // reusable one-shot element to one source instead of recycling it across
      // Scene SE / ending SE files.
      let audio = this.oneshotPool.find((item) => item && item.__spLoadedSrc === targetSrc && !item.__spInUse && !item.__spPriming && item.paused);
      if (!audio) {
        audio = this.oneshotPool.find((item) => item && !item.__spLoadedSrc && !item.__spInUse && !item.__spPriming && item.paused);
      }
      if (!audio) {
        audio = this._createAudioElement(`oneshot-${this.oneshotPool.length + 1}`);
        audio.__spInUse = false;
        audio.__spPriming = false;
        audio.__spAuthorized = false;
        this.oneshotPool.push(audio);
      }
      if (!audio.__spLoadedSrc) audio.__spLoadedSrc = targetSrc;
      return audio;
    }

    _primeFutureAudioPlayback(options = {}) {
      if (!this.document || !this.audioUnlocked || !this.audioPlaybackArmed) return Promise.resolve(false);
      const primePersistent = options.persistent !== false;
      const sources = this._collectFutureAudioSources();
      const jobs = [];

      if (primePersistent) {
        if (sources.bgm && this.audioEls?.bgm?.paused) jobs.push(this._primeMediaElement(this.audioEls.bgm, sources.bgm));
        if (sources.ambient && this.audioEls?.ambient?.paused) jobs.push(this._primeMediaElement(this.audioEls.ambient, sources.ambient));
      }

      for (const src of sources.oneshot) {
        const audio = this._oneShotElementForSource(src);
        if (audio && !audio.__spInUse && !audio.__spPriming && audio.paused) jobs.push(this._primeMediaElement(audio, src));
      }

      return Promise.allSettled(jobs).then(() => true);
    }

    _acquireOneShotElement(src = '') {
      const audio = this._oneShotElementForSource(src);
      if (!audio) return null;
      audio.__spPrimeToken = (audio.__spPrimeToken || 0) + 1;
      audio.__spPriming = false;
      audio.__spInUse = true;
      return audio;
    }

    _stopPersistentChannel(channel, fadeOut = 0) {
      if (this._iosStableMediaBank) {
        const entry = this._iosPersistentEntry?.[channel];
        if (entry) {
          const finish = () => { this._silenceIOSBankEntry(entry, true); if (this._iosPersistentEntry[channel] === entry) this._iosPersistentEntry[channel] = null; this.audioState[channel] = null; emit(this.host, 'sceneplayer:audiostop', { channel, transport:'ios-live-media-bank' }); };
          if (fadeOut > 0 && entry.active) this._setIOSBankEntryVolume(entry, 0, fadeOut, finish);
          else finish();
        } else this.audioState[channel] = null;
        return;
      }
      if (this._bufferPersistent?.[channel]) { this._stopBufferedPersistent(channel, fadeOut); this.audioState[channel] = null; return; }
      const audio = this.audioEls[channel];
      if (!audio) return;
      const finish = () => {
        audio.pause();
        try { audio.currentTime = 0; } catch (_) {}
        this.audioState[channel] = null;
        emit(this.host, 'sceneplayer:audiostop', { channel });
      };
      if (fadeOut > 0 && !audio.paused) this._fadeVolume(audio, 0, fadeOut, channel, finish);
      else finish();
    }

    _startPersistentChannel(channel, command, reconstruct = false, forceSeek = false) {
      if (this._iosStableMediaBank && this._startIOSBankPersistent(channel, command, reconstruct, forceSeek)) return;
      if (this._startBufferedPersistent(channel, command, reconstruct, forceSeek)) return;
      let audio = this.audioEls[channel];
      if (!audio || !command.src) return;
      audio.__spPrimeToken = (audio.__spPrimeToken || 0) + 1;
      audio.__spPriming = false;

      const desiredNativeOnly = this._isExternalHttpAudio(command.src) && !this._isCorsWebAudioAsset(command.src);
      const hasWebAudioGraph = this.audioSourceNodes.has(audio) || this.audioGainNodes.has(audio);
      const currentNativeOnly = audio.__spNativeOnly === true;

      // A media element that has ever been routed through
      // createMediaElementSource() is not reused for native external playback.
      // Likewise, switching back to the Web Audio route gets a fresh element.
      if (
        currentNativeOnly !== desiredNativeOnly ||
        (desiredNativeOnly && hasWebAudioGraph)
      ) {
        audio = this._replacePersistentAudioElement(channel, desiredNativeOnly);
      }

      const sameSrc = this.audioState[channel]?.src === command.src;
      // Audio semantics:
      // BGM = continued time -> history keeps the current playback position when
      // the same source is still active.
      // Ambient = sound that existed there -> history restores that Scene-state
      // from its own startAt, even when the same source is already playing.
      // SE = event -> handled separately as a one-shot on explicit Scene landing.
      const shouldSeek = forceSeek || !sameSrc || (!reconstruct && command.restart === true);
      const targetVolume = clamp(asNumber(command.volume, 1), 0, 1);
      const startAt = Math.max(0, asNumber(command.startAt, 0));

      if (!sameSrc) {
        this._prepareAudioTransport(audio, command.src);
        audio.src = command.src;
        try { audio.load(); } catch (_) {}
      }
      audio.loop = command.loop !== false;
      if (shouldSeek) {
        try { audio.currentTime = startAt; } catch (_) {
          audio.addEventListener('loadedmetadata', () => { try { audio.currentTime = startAt; } catch (_) {} }, { once: true });
        }
      }
      const fadeIn = reconstruct ? 0 : Math.max(0, asNumber(command.fadeIn, 0));
      this._setAudioVolume(audio, fadeIn > 0 ? 0 : targetVolume);
      this.audioState[channel] = {
        src: command.src,
        volume: targetVolume,
        loop: command.loop !== false,
        startAt,
        stopAt: command.stopAt == null ? null : Math.max(0, asNumber(command.stopAt, 0)),
        fadeOut: Math.max(0, asNumber(command.fadeOut, 0))
      };
      this._safePlay(audio, { channel, action: 'start', src: command.src }, () => {
        if (fadeIn > 0) this._fadeVolume(audio, targetVolume, fadeIn, channel);
        const stopAfter = Math.max(0, asNumber(command.stopAfter, 0));
        if (stopAfter > 0) this._audioTimeout(() => this._stopPersistentChannel(channel, command.fadeOut || 0), stopAfter);
      });
      emit(this.host, 'sceneplayer:audiostart', { channel, command, reconstruct });
    }

    _volumePersistentChannel(channel, command) {
      if (this._iosStableMediaBank) {
        const entry = this._iosPersistentEntry?.[channel];
        if (!entry || !this.audioState[channel]) return;
        const target = this.muted ? 0 : clamp(asNumber(command.volume, this.audioState[channel].volume), 0, 1);
        this.audioState[channel].volume = target; entry.targetVolume = target;
        this._setIOSBankEntryVolume(entry, target, Math.max(0, asNumber(command.fade, 0)));
        emit(this.host, 'sceneplayer:audiovolume', { channel, volume: target, transport:'ios-live-media-bank' });
        return;
      }
      const buffered = this._bufferPersistent?.[channel];
      if (buffered) {
        const target = this.muted ? 0 : clamp(asNumber(command.volume, buffered.volume ?? 1), 0, 1);
        buffered.volume = target;
        if (this.audioState[channel]) this.audioState[channel].volume = target;
        this._fadeBufferGain(buffered.gain, target, Math.max(0, asNumber(command.fade, 0)));
        emit(this.host, 'sceneplayer:audiovolume', { channel, volume: target, transport:'audio-buffer' });
        return;
      }
      const audio = this.audioEls[channel];
      if (!audio || !this.audioState[channel]) return;
      const target = clamp(asNumber(command.volume, this.audioState[channel].volume), 0, 1);
      this.audioState[channel].volume = target;
      this._fadeVolume(audio, target, Math.max(0, asNumber(command.fade, 0)), channel);
      emit(this.host, 'sceneplayer:audiovolume', { channel, volume: target });
    }

    _duckPersistentChannel(channel, command) {
      if (this._iosStableMediaBank) {
        const entry = this._iosPersistentEntry?.[channel];
        const state = this.audioState[channel];
        if (!entry || !state) return;
        const restore = state.volume;
        const target = clamp(asNumber(command.volume, 0.22), 0, 1);
        const fade = Math.max(0, asNumber(command.fade, 250));
        const hold = Math.max(0, asNumber(command.hold, 1200));
        this._setIOSBankEntryVolume(entry, target, fade);
        this._audioTimeout(() => this._setIOSBankEntryVolume(entry, this.muted ? 0 : restore, fade), fade + hold);
        emit(this.host, 'sceneplayer:audioduck', { channel, volume: target, hold, transport:'ios-live-media-bank' });
        return;
      }
      const buffered = this._bufferPersistent?.[channel];
      if (buffered) {
        const restore = buffered.volume ?? 1;
        const target = clamp(asNumber(command.volume, 0.22), 0, 1);
        const fade = Math.max(0, asNumber(command.fade, 250));
        const hold = Math.max(0, asNumber(command.hold, 1200));
        this._fadeBufferGain(buffered.gain, target, fade);
        this._audioTimeout(() => this._fadeBufferGain(buffered.gain, restore, fade), fade + hold);
        emit(this.host, 'sceneplayer:audioduck', { channel, volume: target, hold, transport:'audio-buffer' });
        return;
      }
      const audio = this.audioEls[channel];
      const state = this.audioState[channel];
      if (!audio || !state) return;
      const restore = state.volume;
      const target = clamp(asNumber(command.volume, 0.22), 0, 1);
      const fade = Math.max(0, asNumber(command.fade, 250));
      const hold = Math.max(0, asNumber(command.hold, 1200));
      this._fadeVolume(audio, target, fade, channel);
      this._audioTimeout(() => this._fadeVolume(audio, restore, fade, channel), fade + hold);
      emit(this.host, 'sceneplayer:audioduck', { channel, volume: target, hold });
    }

    _playOneShot(command, onEnded = null) {
      if (!command.src) return;
      if (this._iosStableMediaBank && this._playIOSBankOneShot(command)) return;
      if (this._playBufferedOneShot(command)) return;
      const audio = this._acquireOneShotElement(command.src);
      if (!audio) return;
      this._prepareAudioTransport(audio, command.src);
      if (audio.src !== command.src && audio.currentSrc !== command.src) {
        // This should only happen on a fresh, not-yet-graph-bound element.
        audio.src = command.src;
        audio.__spLoadedSrc = command.src;
        try { audio.load(); } catch (_) {}
      }
      audio.loop = command.loop === true;
      const targetVolume = clamp(asNumber(command.volume, 1), 0, 1);
      const fadeIn = Math.max(0, asNumber(command.fadeIn, 0));
      this._setAudioVolume(audio, fadeIn > 0 ? 0 : targetVolume);
      const startAt = Math.max(0, asNumber(command.startAt, 0));
      if (startAt > 0) {
        audio.addEventListener('loadedmetadata', () => { try { audio.currentTime = startAt; } catch (_) {} }, { once: true });
      }
      const cleanup = () => {
        this.oneshots.delete(audio);
        audio.removeEventListener('ended', cleanup);
        audio.__spInUse = false;
        audio.loop = false;
        if (typeof onEnded === 'function') { try { onEnded(); } catch (_) {} }
      };
      audio.addEventListener('ended', cleanup);
      this.oneshots.add(audio);
      const fadeKey = `oneshot:${Date.now()}:${Math.random()}`;
      this._safePlay(audio, { channel: 'oneshot', role: command.role || 'se', action: 'play', src: command.src }, () => {
        if (fadeIn > 0) this._fadeVolume(audio, targetVolume, fadeIn, fadeKey);
        const stopAfter = Math.max(0, asNumber(command.stopAfter, 0));
        if (stopAfter > 0) this._audioTimeout(() => { audio.pause(); cleanup(); }, stopAfter);
      });
      if (command.stopAt != null) {
        const stopAt = Math.max(0, asNumber(command.stopAt, 0));
        const onTime = () => {
          if (audio.currentTime >= stopAt) { audio.pause(); audio.removeEventListener('timeupdate', onTime); cleanup(); }
        };
        audio.addEventListener('timeupdate', onTime);
      }
      emit(this.host, 'sceneplayer:oneshot', { command });
    }

    _applyAudioCommand(command, reconstruct = false) {
      if (!command || typeof command !== 'object') return;
      const channel = command.channel;
      const action = command.action;
      if (channel === 'oneshot') {
        // One-shots represent an event, so history reconstruction never replays them.
        if (!reconstruct && (action === 'play' || action === 'start')) {
          // V52: authorable SE timing. `delay` and `repeat` were already written
          // by Studio but the Player ignored both fields. Delay is before the
          // first hit; repeat schedules additional hits after the previous clip
          // duration when known (fallback 250ms), preserving one-shot semantics.
          const delay = Math.max(0, asNumber(command.delay, 0));
          const repeat = Math.max(1, Math.round(asNumber(command.repeat, 1)));
          // V53: chain repeats from the actual `ended` event. The old
          // duration probe usually had NaN before metadata loaded, fell back to
          // 250ms and caused overlapping/incorrect repeat counts.
          const playSeries = (remaining) => {
            if (remaining <= 0) return;
            this._playOneShot(command, remaining > 1 ? () => playSeries(remaining - 1) : null);
          };
          if (delay > 0) this._audioTimeout(() => playSeries(repeat), delay);
          else playSeries(repeat);
        }
        return;
      }
      if (!(channel === 'bgm' || channel === 'ambient')) return;
      if (action === 'start' || action === 'play') this._startPersistentChannel(channel, command, reconstruct);
      else if (action === 'stop') this._stopPersistentChannel(channel, reconstruct ? 0 : Math.max(0, asNumber(command.fadeOut ?? command.fade, 0)));
      else if (action === 'volume') this._volumePersistentChannel(channel, command);
      else if (action === 'duck' && !reconstruct) this._duckPersistentChannel(channel, command);
    }

    _applySceneAudio(scene, reconstruct = false) {
      if (!Array.isArray(scene?.audio)) return;
      scene.audio.forEach((command) => this._applyAudioCommand(command, reconstruct));
    }

    _queueInitialOneShots(scene) {
      if (!Array.isArray(scene?.audio)) return;
      scene.audio.forEach((command) => {
        if (command?.channel === 'oneshot' && (command.action === 'play' || command.action === 'start')) {
          this._queueAudio(() => this._playOneShot(command));
        }
      });
    }

    _stopOneShots() {
      this.oneshots.forEach((audio) => {
        try { audio.pause(); } catch (_) {}
        audio.__spInUse = false;
        audio.loop = false;
      });
      this.oneshots.clear();
    }

    _derivePersistentAudioState(index) {
      const result = { bgm: null, ambient: null };
      if (!this.document) return result;
      for (let i = 0; i <= index; i += 1) {
        const commands = this.document.scenes[i]?.audio;
        if (!Array.isArray(commands)) continue;
        for (const cmd of commands) {
          if (!(cmd?.channel === 'bgm' || cmd?.channel === 'ambient')) continue;
          const ch = cmd.channel;
          if (cmd.action === 'start' || cmd.action === 'play') {
            result[ch] = {
              src: cmd.src,
              volume: clamp(asNumber(cmd.volume, 1), 0, 1),
              loop: cmd.loop !== false,
              startAt: Math.max(0, asNumber(cmd.startAt, 0)),
              stopAt: cmd.stopAt == null ? null : Math.max(0, asNumber(cmd.stopAt, 0)),
              fadeOut: Math.max(0, asNumber(cmd.fadeOut, 0)),
              restart: true
            };
          } else if (cmd.action === 'stop') result[ch] = null;
          else if (cmd.action === 'volume' && result[ch]) result[ch].volume = clamp(asNumber(cmd.volume, result[ch].volume), 0, 1);
          // duck is transient and deliberately not part of reconstructed state.
        }
      }
      return result;
    }

    _restoreAudioForIndex(index, mode = 'restore') {
      this._clearAudioTimers();
      this._stopOneShots();
      const desired = this._derivePersistentAudioState(index);

      // BGM: 続いていた時間
      // When landing in History, keep time if the same BGM is valid there.
      const bgm = desired.bgm;
      if (!bgm) this._stopPersistentChannel('bgm', 0);
      else this._startPersistentChannel('bgm', bgm, true, false);

      // Ambient: その時そこにあった音
      // History is a state restoration, not a continuous timeline. Restore the
      // Ambient that was active at that Scene and restart it from its configured
      // startAt so rain / room tone / machinery / drones / any sustained asset
      // behaves as the sound of that place/state rather than elapsed time.
      const ambient = desired.ambient;
      if (!ambient) this._stopPersistentChannel('ambient', 0);
      else this._startPersistentChannel('ambient', ambient, true, mode === 'history');
    }

    _stopAllAudio(resetPending = true) {
      this._clearAudioTimers();
      if (this._iosStableMediaBank) {
        this._iosAudioBank?.forEach((entry) => this._silenceIOSBankEntry(entry, true));
        this._iosPersistentEntry = { bgm:null, ambient:null };
        this.audioState = { bgm:null, ambient:null };
      }
      ['bgm', 'ambient'].forEach((channel) => this._stopPersistentChannel(channel, 0));
      Array.from(this._bufferOneShots || []).forEach((rec) => { try { rec.source.stop(); } catch (_) {} });
      if (this._bufferOneShots) this._bufferOneShots.clear();
      this.oneshots.forEach((audio) => {
        try { audio.pause(); } catch (_) {}
        audio.__spInUse = false;
        audio.loop = false;
      });
      this.oneshots.clear();
      (this.oneshotPool || []).forEach((audio) => {
        try { audio.pause(); } catch (_) {}
        audio.__spPrimeToken = (audio.__spPrimeToken || 0) + 1;
        audio.__spPriming = false;
        audio.__spInUse = false;
        audio.loop = false;
      });
      if (resetPending) this.audioPending.length = 0;
    }

    // Graceful shell/cover exit. Public Player calls this before replacing or
    // hiding Core; previously that API did not exist, so audio stayed at full
    // volume until destroy() and ended with an audible hard cut.
    fadeOutAudio(duration = 700) {
      const ms = Math.max(0, asNumber(duration, 700));
      this._clearAudioTimers();

      if (this._iosStableMediaBank) {
        this._iosAudioBank?.forEach((entry) => {
          if (!entry?.active || !entry.audio || entry.audio.muted) return;
          this._setIOSBankEntryVolume(entry, 0, ms, () => this._silenceIOSBankEntry(entry, false));
        });
        return true;
      }

      ['bgm', 'ambient'].forEach((channel) => {
        const buffered = this._bufferPersistent?.[channel];
        if (buffered) {
          this._fadeBufferGain(buffered.gain, 0, ms);
          this._audioTimeout(() => this._stopBufferedPersistent(channel, 0), ms + 20);
          return;
        }
        const audio = this.audioEls[channel];
        if (!audio || audio.paused) return;
        const key = `exit:${channel}`;
        this._fadeVolume(audio, 0, ms, key, () => {
          try { audio.pause(); } catch (_) {}
          this.audioState[channel] = null;
        });
      });

      Array.from(this._bufferOneShots || []).forEach((rec) => {
        this._fadeBufferGain(rec.gain, 0, ms);
        this._audioTimeout(() => { try { rec.source.stop(); } catch (_) {} }, ms + 20);
      });
      Array.from(this.oneshots).forEach((audio, i) => {
        if (!audio || audio.paused) return;
        const key = `exit:oneshot:${i}:${Date.now()}`;
        this._fadeVolume(audio, 0, ms, key, () => {
          try { audio.pause(); } catch (_) {}
          this.oneshots.delete(audio);
        });
      });

      if (!ms) this.audioPending.length = 0;
      emit(this.host, 'sceneplayer:audiofadeout', { duration: ms });
      return ms;
    }

    _clearPresentationTimers() {
      this.presentationTimers.forEach((timer) => clearTimeout(timer));
      this.presentationTimers.length = 0;
    }

    _clearBackgroundTimers() {
      this.backgroundTimers.forEach((timer) => clearTimeout(timer));
      this.backgroundTimers.length = 0;
    }

    _backgroundTimeout(fn, delay) {
      const timer = setTimeout(() => {
        const i = this.backgroundTimers.indexOf(timer);
        if (i >= 0) this.backgroundTimers.splice(i, 1);
        fn();
      }, Math.max(0, delay));
      this.backgroundTimers.push(timer);
      return timer;
    }

    _stopTyping(complete = false) {
      const state = this.typingState;
      if (!state) return false;
      clearInterval(state.timer);
      if (complete && state.node?.isConnected) {
        state.node.textContent = state.text;
        state.node.classList.remove('is-typing');
      }
      this.typingState = null;
      return true;
    }

    _resetPresentationRuntime() {
      this._clearPresentationTimers();
      this._stopTyping(false);
    }

    _resetChatReadRuntime() {
      // Read receipts persist while the reader stays in the same reading session
      // (including PAST), but a new read/preview must start from unread again.
      for (const timer of this.chatReadTimers.values()) clearTimeout(timer);
      this.chatReadTimers.clear();
      this.chatReadStartedAt.clear();
      for (const timer of this.messageStateTimers.values()) clearTimeout(timer);
      this.messageStateTimers.clear();
      this.messageStateStartedAt.clear();
      this.chatReadSceneKeys = new WeakMap();
      this.chatReadSceneKeySeq = 0;
    }

    _resetBackgroundRuntime() {
      this._clearBackgroundTimers();
      this.els?.bgFlash?.classList.remove('is-active');
      this.host?.classList.remove('sp-bg-glitching');
    }

    _presentationTimeout(fn, delay) {
      const timer = setTimeout(() => {
        const i = this.presentationTimers.indexOf(timer);
        if (i >= 0) this.presentationTimers.splice(i, 1);
        fn();
      }, Math.max(0, delay));
      this.presentationTimers.push(timer);
      return timer;
    }

    _chatIconSource(presentation = {}) {
      return presentation.chat?.icon || ahakoAvatarSrc(presentation.chat?.iconPreset) || '';
    }

    _warmChatIcon(src) {
      if (!src) return null;
      if (!this._chatIconCache) this._chatIconCache = new Map();
      let image = this._chatIconCache.get(src);
      if (!image) {
        image = document.createElement('img');
        image.alt = '';
        image.loading = 'eager';
        image.fetchPriority = 'low';
        image.decoding = 'async';
        // Icons are requested after the cover/first Scene background has started,
        // so several speaker images cannot compete with the large background.
        image.src = src;
        this._chatIconCache.set(src, image);
        if (typeof image.decode === 'function') image.decode().catch(() => {});
      }
      const pending = this._pendingChatIconImages?.get(src);
      if (pending) {
        pending.forEach((target) => { target.src = src; });
        this._pendingChatIconImages.delete(src);
      }
      return image;
    }

    _preloadChatIcons() {
      const sources = new Set();
      for (const scene of this.document?.scenes || []) {
        if (scene.presentation?.view !== 'chat') continue;
        const src = this._chatIconSource(scene.presentation);
        if (src) sources.add(src);
      }
      // Retain only this document's unique avatars; repeated Studio loads must
      // not accumulate decoded images from previous works or edited speakers.
      if (this._chatIconCache) {
        for (const src of this._chatIconCache.keys()) {
          if (!sources.has(src)) this._chatIconCache.delete(src);
        }
      }
      if (this._pendingChatIconImages) {
        for (const src of this._pendingChatIconImages.keys()) {
          if (!sources.has(src)) this._pendingChatIconImages.delete(src);
        }
      }
      sources.forEach((src) => this._warmChatIcon(src));
    }

    _chatIconImage(src) {
      if (!src) return null;
      const cached = this._chatIconCache?.get(src);
      const image = document.createElement('img');
      image.alt = '';
      image.loading = 'eager';
      image.fetchPriority = 'low';
      image.decoding = 'async';
      if (cached) {
        image.src = src;
      } else {
        if (!this._pendingChatIconImages) this._pendingChatIconImages = new Map();
        if (!this._pendingChatIconImages.has(src)) this._pendingChatIconImages.set(src, new Set());
        this._pendingChatIconImages.get(src).add(image);
      }
      return image;
    }

    load(doc, options = {}) {
      if (this.destroyed) throw new Error('ScenePlayerCore has been destroyed.');
      this.stopAuto();
      this._resetPresentationRuntime();
      this._resetChatReadRuntime();
      this._resetBackgroundRuntime();
      this._stopAllAudio(true);
      this._endingAudioStarted = false;

      // Documents can be repeatedly previewed/edited in the same Studio session.
      // Persistent media elements may retain an irreversible Web Audio routing
      // history from the previous document, so begin each load with clean
      // transport elements while preserving the AudioContext itself.
      ['bgm','ambient'].forEach((channel) => {
        const oldAudio = this.audioEls[channel];
        if (this.audioSourceNodes.has(oldAudio) || oldAudio?.__spNativeOnly) {
          this._disposeAudioElement(oldAudio);
          this.audioEls[channel] = this._createAudioElement(channel);
        }
      });

      this.audioPlaybackArmed = false;
      this.playbackTimelineStartedAt = 0;
      this.document = assertSceneDocument(doc);

      // iOS: build a source-stable native-media bank now. Actual play() calls
      // happen together in the trusted START gesture in _beginFromCover().
      if (this._iosStableMediaBank) this._prepareIOSMediaBank();

      // Preload Ending SE only. Playback waits for the final trusted press.
      try {
        this.endingAudio.pause();
        this.endingAudio.removeAttribute('src');
        const endingCommand = (Array.isArray(this.document?.ending?.audio) ? this.document.ending.audio : [])
          .find((command) => command?.channel === 'oneshot' && command?.src && ['play','start'].includes(command.action || 'play'));
        if (endingCommand?.src) {
          const endingSrc = this._resolveCoreAudioSrc(endingCommand.src);
          this.endingAudio.__spPrimed = false;
          this.endingAudio.__spLoadedSrc = endingSrc;
          this.endingAudio.src = endingSrc;
          this.endingAudio.preload = 'auto';
          this.endingAudio.loop = true;
          this.endingAudio.muted = true;
          try { this.endingAudio.load(); } catch (_) {}
        }
      } catch (_) {}

      this._backgroundStateCache = [];
      this._backgroundStateCacheDocument = this.document;

      // Scene Format v1: author-level navigation policy.
      // Constructor options remain the fallback for older documents.
      const authorAllowPrevious = doc.player?.navigation?.allowPrevious;
      if (typeof authorAllowPrevious === 'boolean') this.options.allowPrevious = authorAllowPrevious;
      this.els.prev.hidden = !this.options.allowPrevious;
      this.host.classList.toggle('sp-no-previous', !this.options.allowPrevious);

      this.index = clamp(asNumber(options.startAt, this.options.startAt), 0, doc.scenes.length - 1);
      this.maxVisitedIndex = this.index;
      this.historyOpen = false;
      this.els.history.hidden = true;
      this.host.classList.remove('sp-history-open');
      this.ended = false;

      this.host.dataset.theme = doc.theme;
      this.host.dataset.font = doc.appearance?.typography?.fontFamily || 'serif';
      this.host.dataset.cinemaTone = doc.theme === 'cinema' ? (doc.appearance?.cinemaTone === 'light' ? 'light' : 'dark') : '';
      this.host.dataset.language = doc.language || '';
      this.host.dataset.languages = Array.isArray(doc.languages) ? doc.languages.join(' ') : '';
      this.host.dataset.preset = doc.preset || '';
      this.host.setAttribute('lang', doc.language || 'und');
      this.host.setAttribute('dir', doc.direction || 'auto');
      this.els.title.textContent = doc.title || '';
      this.els.author.textContent = doc.author || '';
      this.els.total.textContent = String(doc.scenes.length);
      this.refreshDocumentChrome({document:doc});
      const authoredEndingLabel=String(doc.ending?.label || doc.ending?.title || '').trim();
      this.els.endingTitle.textContent = authoredEndingLabel || this._uiText('player.ending.title');
      const endingFamilies={serif:'var(--sp-font-serif)',sans:'var(--sp-font-sans)',mono:'var(--sp-font-mono)'};
      this.els.endingTitle.style.setProperty('font-family', endingFamilies[doc.ending?.fontFamily]||endingFamilies.serif, 'important');
      this.els.endingText.textContent = '';
      const endingLinks=Array.isArray(doc.ending?.links)?doc.ending.links:[];
      const endingHasPositions=endingLinks.some(x=>x?.position==='left'||x?.position==='right');
      const left=endingHasPositions?(endingLinks.find(x=>x?.position==='left')||null):(endingLinks[0]||null);
      const right=endingHasPositions?(endingLinks.find(x=>x?.position==='right')||null):(endingLinks.length>1?endingLinks[1]:null);
      const applyEndingSlot=(button,item)=>{if(!button)return;const label=String(item?.label||item?.title||'').trim();const kicker=String(item?.kicker||'').trim();button.hidden=!label;const s=button.querySelector('small'),b=button.querySelector('strong');if(s){s.textContent=kicker;s.hidden=!kicker;}if(b)b.textContent=label;button.dataset.previewUrl=String(item?.url||item?.href||'').trim();};
      applyEndingSlot(this.els.endingLeft,left); applyEndingSlot(this.els.endingRight,right);
      this.els.ending.hidden = true;
      this.backgroundState = null;
      this.backgroundLayerIndex = 0;
      this.backgroundMotionEpoch = 0;
      this._resetBackgroundLayers();
      // Studio loads Scene 1 underneath the cover for layout/background,
      // but Cover is not a Scene and must not execute Scene audio.
      this._audioRenderMode = 'cover';

      this._render();
      this.showCover();
      // Let the first Scene/cover background request enter the network queue
      // before warming unique chat avatars during the cover pause.
      if (this._chatIconPreloadTimer) clearTimeout(this._chatIconPreloadTimer);
      this._chatIconPreloadTimer = setTimeout(() => {
        this._chatIconPreloadTimer = 0;
        if (!this.destroyed && this.document === doc) this._preloadChatIcons();
      }, 180);
      emit(this.host, 'sceneplayer:load', { document: doc, index: this.index });
      return this;
    }

    refreshDocumentChrome(options = {}) {
      const nextDocument = options.document || null;
      if (nextDocument) this.document = nextDocument;
      const doc = this.document;
      if (!doc) return false;

      const families = {
        serif: 'var(--sp-font-serif)',
        sans: 'var(--sp-font-sans)',
        mono: 'var(--sp-font-mono)'
      };
      const coverFamily = families[doc.cover?.fontFamily] || families.serif;
      const endingFamily = families[doc.ending?.fontFamily] || families.serif;
      this.host.style.setProperty('--sp-cover-font', coverFamily);

      const canonicalTitle = String(doc.title || '').trim()==='Untitled' ? '' : String(doc.title || '');
      if (this.els.title) this.els.title.textContent = canonicalTitle;
      if (this.els.author) this.els.author.textContent = doc.author || '';

      const logoSrc = String(doc.cover?.logo?.src || '').trim();
      if (this.els.coverLogo) {
        this.els.coverLogo.src = logoSrc;
        this.els.coverLogo.hidden = !logoSrc;
      }
      const coverText = doc.cover?.text || {}; // legacy read-only fallback
      const visibility = doc.cover?.visibility || {};
      const canonicalValue = (key, fallback='') => {
        const clean=String(fallback??'');
        if(clean.trim() && !(key==='title' && clean.trim()==='Untitled')) return clean;
        return Object.prototype.hasOwnProperty.call(coverText,key) ? String(coverText[key] ?? '') : '';
      };
      const coverVisible = (key,value) => {
        if(Object.prototype.hasOwnProperty.call(visibility,key)) return visibility[key]!==false && Boolean(String(value||'').trim());
        if(Object.prototype.hasOwnProperty.call(coverText,key) && String(coverText[key]??'')==='') return false;
        return Boolean(String(value||'').trim());
      };
      if (this.els.coverTitle) { const title=canonicalValue('title',doc.title||''); this.els.coverTitle.textContent=title; this.els.coverTitle.hidden=Boolean(logoSrc)||!coverVisible('title',title); }
      if (this.els.coverAuthor) { const author=canonicalValue('author',doc.author||''); this.els.coverAuthor.textContent=author; this.els.coverAuthor.hidden=!coverVisible('author',author); }
      if (this.els.coverSubtitle) { const subtitle=canonicalValue('subtitle',doc.metadata?.subtitle||doc.subtitle||''); this.els.coverSubtitle.textContent=subtitle; this.els.coverSubtitle.hidden=!coverVisible('subtitle',subtitle); }
      if (this.els.coverEpisode) { const episode=canonicalValue('episode',doc.metadata?.episode||doc.episode||''); this.els.coverEpisode.textContent=episode; this.els.coverEpisode.hidden=!coverVisible('episode',episode); }
      if (this.els.coverEpisodeTitle) { const episodeTitle=canonicalValue('episodeTitle',doc.metadata?.episodeTitle||doc.episodeTitle||''); this.els.coverEpisodeTitle.textContent=episodeTitle; this.els.coverEpisodeTitle.hidden=!coverVisible('episodeTitle',episodeTitle); }

      const coverStyles = doc.cover?.styles || {};
      const coverStyleMap = [
        [this.els.coverTitle,'title'],
        [this.els.coverSubtitle,'subtitle'],
        [this.els.coverAuthor,'author'],
        [this.els.coverEpisode,'episode'],
        [this.els.coverEpisodeTitle,'episodeTitle']
      ];
      const coverSizeScale = { small:.78, normal:1, large:1.28, xl:1.6 };
      const coverFontMap = {
        serif:'var(--sp-font-serif)',
        sans:'var(--sp-font-sans)',
        mono:'var(--sp-font-mono)'
      };
      for (const [el,key] of coverStyleMap) {
        if (!el) continue;
        const st = coverStyles[key] || {};
        el.style.removeProperty('color');
        el.style.removeProperty('font-size');
        el.style.removeProperty('font-family');
        // Resolve size from this field's native CSS size. Do this only after
        // removing the prior inline value, otherwise repeated refreshes compound.
        const baseSize=parseFloat(getComputedStyle(el).fontSize)||16;
        if (st.color) el.style.setProperty('color',String(st.color),'important');
        if (st.size && st.size !== 'auto') {
          const resolved=typeof st.size==='number'
            ? Number(st.size)
            : baseSize*(coverSizeScale[String(st.size)]||1);
          if(Number.isFinite(resolved))el.style.setProperty('font-size',`${resolved}px`,'important');
        }
        if (st.fontFamily && st.fontFamily !== 'inherit') {
          const fam=coverFontMap[st.fontFamily];
          if (fam) el.style.setProperty('font-family',fam,'important');
        }
      }

      const authoredEndingLabel = String(doc.ending?.label || doc.ending?.title || '').trim();
      if (this.els.endingTitle) {
        this.els.endingTitle.textContent = authoredEndingLabel || this._uiText('player.ending.title');
        this.els.endingTitle.style.setProperty('font-family', endingFamily, 'important');
        const endingStyle=doc.ending?.style||{};
        const sizeMap={small:'clamp(15px,3.5vw,22px)',normal:'clamp(18px,4.6vw,30px)',large:'clamp(24px,6.2vw,42px)',xl:'clamp(30px,8vw,56px)'};
        const fontMap={serif:'var(--sp-font-serif)',sans:'var(--sp-font-sans)',mono:'var(--sp-font-mono)'};
        this.els.endingTitle.style.removeProperty('color');
        this.els.endingTitle.style.removeProperty('font-size');
        if(endingStyle.color)this.els.endingTitle.style.setProperty('color',String(endingStyle.color),'important');
        if(endingStyle.size&&endingStyle.size!=='auto'){
          const size=typeof endingStyle.size==='number'?`${endingStyle.size}px`:sizeMap[endingStyle.size];
          if(size)this.els.endingTitle.style.setProperty('font-size',size,'important');
        }
        if(endingStyle.fontFamily&&endingStyle.fontFamily!=='inherit'){
          const fam=fontMap[endingStyle.fontFamily];
          if(fam)this.els.endingTitle.style.setProperty('font-family',fam,'important');
        }
      }
      const endingLinks = Array.isArray(doc.ending?.links) ? doc.ending.links : [];
      const hasPositions = endingLinks.some((x) => x?.position === 'left' || x?.position === 'right');
      const left = hasPositions ? (endingLinks.find((x) => x?.position === 'left') || null) : (endingLinks[0] || null);
      const right = hasPositions ? (endingLinks.find((x) => x?.position === 'right') || null) : (endingLinks.length > 1 ? endingLinks[1] : null);
      const applySlot = (button, item) => {
        if (!button) return;
        const label = String(item?.label || item?.title || '').trim();
        const kicker = String(item?.kicker || '').trim();
        button.hidden = !label;
        const small = button.querySelector('small');
        const strong = button.querySelector('strong');
        if (small) { small.textContent = kicker; small.hidden = !kicker; }
        if (strong) strong.textContent = label;
        button.dataset.previewUrl = String(item?.url || item?.href || '').trim();
      };
      applySlot(this.els.endingLeft, left);
      applySlot(this.els.endingRight, right);
      return true;
    }

    get currentScene() {
      return this.document?.scenes?.[this.index] || null;
    }

    get progress() {
      if (!this.document) return 0;
      return (this.index + 1) / this.document.scenes.length;
    }

    _openCurrentMailBeforeAdvance() {
      const scene = this.currentScene;
      const presentation = scene?.presentation || {};
      if (presentation.view !== 'web-mail') return false;
      const mail = presentation.webMail || {};
      if (mail.folder === 'draft') return false;
      const activeScene = this.els?.stage?.querySelector?.('.sp-scene.is-active');
      const card = activeScene?.querySelector?.('.sp-web-mail-card');
      if (!card || card.classList.contains('is-open')) return false;
      card.classList.add('is-open');
      return true;
    }

    next() {
      if (!this.document || this.ended) return false;
      // Web Mail v0.3: the first advance action opens the current mail instead
      // of skipping straight to the next Scene. Drafts are authored as already
      // open. Once opened, the next tap/Enter/swipe/auto advance behaves normally.
      if (this._openCurrentMailBeforeAdvance()) {
        if (this._stopTyping(true)) {
          emit(this.host, 'sceneplayer:typingend', { index: this.index, scene: this.currentScene, skipped: true });
        }
        this._scheduleAuto();
        return true;
      }
      if (this._stopTyping(true)) {
        emit(this.host, 'sceneplayer:typingend', { index: this.index, scene: this.currentScene, skipped: true });
        this._scheduleAuto();
        return true;
      }
      this._clearAutoTimer();

      // The current Scene's entrance belongs only to its arrival.
      // If the reader advances before the animation naturally ends,
      // finish it NOW before moving that Scene into the past stack.
      this._finishVisibleEntranceEffects();
      this._clearPresentationTimers();

      if (this.index < this.document.scenes.length - 1) {
        this.index += 1;
        this.maxVisitedIndex = Math.max(this.maxVisitedIndex, this.index);
        this._audioRenderMode = 'advance';
        this._render();
        emit(this.host, 'sceneplayer:scenechange', { index: this.index, scene: this.currentScene, direction: 'next' });
        return true;
      }

      if (this.options.endOnNextAction) this.finish();
      else this.finish();
      return false;
    }


    previous() {
      // Kept for API compatibility. "Previous" now means entering History,
      // not stepping backward one Scene.
      return this.openHistory();
    }

    openHistory(options = {}) {
      if (!this.document || !this.options.allowPrevious || (!this.options.historyAllScenes && this.maxVisitedIndex <= 0)) return false;
      this.stopAuto();
      this._clearPresentationTimers();
      this.historyOpen = true;
      this.host.classList.add('sp-history-open');
      this.els.history.hidden = false;
      this._renderHistory();

      requestAnimationFrame(() => {
        const current = this.els.historyList.querySelector(`.sp-history-item[data-index="${this.index}"]`);
        if (current) {
          const box = current.getBoundingClientRect();
          const viewport = this.els.historyScroll.getBoundingClientRect();
          const target = this.els.historyScroll.scrollTop
            + (box.top - viewport.top)
            - ((viewport.height - box.height) / 2);
          this.els.historyScroll.scrollTop = Math.max(0, target);

          // A pull gesture should feel like grabbing the drum and moving into the past.
          // Give it a small initial offset while preserving native momentum afterwards.
          const drag = Math.abs(asNumber(options.dragDistance, 0));
          const wheel = Math.abs(asNumber(options.wheelDelta, 0));
          if (drag > 0 || wheel > 0) {
            this.els.historyScroll.scrollTop = Math.max(
              0,
              this.els.historyScroll.scrollTop - clamp((drag || wheel) * 0.7, 18, 110)
            );
          }
        }
        this._updateHistoryDepth();
      });

      emit(this.host, 'sceneplayer:historyopen', {
        index: this.index,
        maxVisitedIndex: this.maxVisitedIndex
      });
      return true;
    }

    closeHistory(options = {}) {
      if (!this.historyOpen) return false;
      this.historyOpen = false;
      this.host.classList.remove('sp-history-open');
      this.els.history.hidden = true;
      if (!options.keepVisualState) this.els.stage.focus({ preventScroll: true });
      emit(this.host, 'sceneplayer:historyclose', {
        index: this.index,
        maxVisitedIndex: this.maxVisitedIndex
      });
      return true;
    }


    _boardReplyLabel(meta){
      const v=String(meta?.replyTo||'').trim().replace(/^(?:>>|＞＞)\s*/, '');
      return v?`>>${v}`:'';
    }

    _boardAnchorUsesHover(){
      try{return !!window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches;}catch(_){return false;}
    }

    _cancelBoardAnchorPopupClose(){
      if(this._boardAnchorCloseTimer){clearTimeout(this._boardAnchorCloseTimer);this._boardAnchorCloseTimer=null;}
    }

    _scheduleBoardAnchorPopupClose(delay=180){
      this._cancelBoardAnchorPopupClose();
      this._boardAnchorCloseTimer=setTimeout(()=>{
        document.querySelector?.('.sp-board-anchor-overlay')?.remove();
        this._boardAnchorCloseTimer=null;
      },delay);
    }

    _bindBoardAnchor(el, sourceScene, meta){
      if(!el)return;
      const open=e=>this._showBoardAnchorPopup(sourceScene,meta,e,{hover:this._boardAnchorUsesHover()});
      // Anchor gestures must never bubble into the Player's scene-advance gesture.
      ['pointerdown','mousedown','touchstart'].forEach(type=>el.addEventListener(type,e=>e.stopPropagation(),{passive:true}));
      if(this._boardAnchorUsesHover()){
        el.addEventListener('mouseenter',e=>{this._cancelBoardAnchorPopupClose();open(e);});
        el.addEventListener('mouseleave',()=>this._scheduleBoardAnchorPopupClose());
        el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();});
      }else{
        el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const existing=document.querySelector?.('.sp-board-anchor-overlay');if(existing){existing.remove();return;}open(e);});
      }
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();open(e);}});
    }

    _showBoardAnchorPopup(sourceScene, meta, event, options={}){
      event?.preventDefault?.();event?.stopPropagation?.();this._cancelBoardAnchorPopupClose();
      const raw=String(meta?.replyTo||'').trim().replace(/^(?:>>|＞＞)\s*/, '');
      if(!raw)return;
      const threadId=String(meta?.replyThreadId||meta?.threadId||'');
      const scenes=this.document?.scenes||[];
      const sourceIndex=Math.max(0,scenes.indexOf(sourceScene));
      const matches=[];
      scenes.forEach((sc,i)=>{const p=sc?.presentation||{},b=p.webBoard||{};if(p.view==='web-board'&&String(b.threadId||'')===threadId&&String(b.number??'')===raw)matches.push({sc,i,b,p});});
      let hit=[...matches].reverse().find(x=>x.i<sourceIndex)||matches[0]||null;
      let overlay=document.querySelector?.('.sp-board-anchor-overlay');
      if(overlay)overlay.remove();
      overlay=document.createElement('div');overlay.className='sp-board-anchor-overlay';if(options.hover)overlay.classList.add('is-hover');
      const boardTheme=String(this.document?.theme||'light');const cinemaTone=String(this.document?.appearance?.cinemaTone||'dark');overlay.dataset.boardTone=(boardTheme==='dark'||(boardTheme==='cinema'&&cinemaTone!=='light'))?'dark':'light';
      const card=document.createElement('div');card.className='sp-board-anchor-popup';
      const close=document.createElement('button');close.type='button';close.className='sp-board-anchor-close';close.textContent='×';close.addEventListener('click',e=>{e.stopPropagation();overlay.remove();});
      card.appendChild(close);
      if(!hit){const missing=document.createElement('div');missing.className='sp-board-anchor-missing';missing.textContent=`>>${raw} は見つかりません`;card.appendChild(missing);}
      else{
        const head=document.createElement('div');head.className='sp-board-anchor-head';
        const name=String(hit.b.name||hit.sc.subText||'名無しさん'),email=String(hit.b.email||''),date=this._logTimeText(hit.sc,hit.p),uid=String(hit.b.userId||'');
        head.textContent=`${hit.b.number??raw} 名前：${name}${email?` [${email}]`:''}${date?` ${date}`:''}${uid?` ID:${uid}`:''}`;
        const body=document.createElement('div');body.className='sp-board-anchor-body';body.textContent=String(hit.sc.text||'');
        card.append(head,body);
      }
      overlay.appendChild(card);
      overlay.addEventListener('click',e=>{e.stopPropagation();if(e.target===overlay)overlay.remove();});
      document.body.appendChild(overlay);
    }

    _renderHistory() {
      if (!this.document) return;
      const fragment = document.createDocumentFragment();
      this.els.historyList.innerHTML = '';

      const historyLastIndex = this.options.historyAllScenes ? this.document.scenes.length - 1 : this.maxVisitedIndex;
      for (let i = 0; i <= historyLastIndex; i += 1) {
        const scene = this.document.scenes[i];
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'sp-history-item';
        item.dataset.index = String(i);
        item.dataset.sceneId = scene.id;
        if (i === this.index) item.classList.add('is-current');

        const num = document.createElement('span');
        num.className = 'sp-history-number';
        num.textContent = `${i + 1} / ${this.document.scenes.length}`;

        const body = document.createElement('span');
        body.className = 'sp-history-body';

        const historyPresentation = scene.presentation || {};
        if (historyPresentation.view === 'web-qa') {
          item.classList.add('sp-history-web-qa');const q=historyPresentation.webQA||{},a=q.answer||{},qaIndex=(this.document?.scenes||[]).indexOf(scene);let kind=q.kind||'legacy-answer';
          let qScene=scene,qPresentation=historyPresentation,qData=q;
          if(kind==='answer'&&q.qaId){for(let j=qaIndex-1;j>=0;j--){const cand=this.document?.scenes?.[j],cp=cand?.presentation||{},cq=cp.webQA||{};if(cp.view!=='web-qa')break;if(cq.qaId===q.qaId&&cq.kind==='question'){qScene=cand;qPresentation=cp;qData=cq;break;}}}
          const qu=qData.question||{},wrap=document.createElement('div');wrap.className='sp-web-qa-wrap';
          const makeQuestion=()=>{const qbox=document.createElement('div');qbox.className='sp-web-qa-question';const qt=document.createElement('div');qt.className='sp-web-qa-title';qt.textContent=qu.title||'質問';const qb=document.createElement('div');qb.className='sp-web-qa-question-body';if(kind==='question'&&qScene===scene)qb.classList.add('is-question-scene-text');qb.textContent=qData.kind==='question'?String(qScene.text||''):String(qu.body||'');const qmeta=document.createElement('div');qmeta.className='sp-web-qa-question-meta';const qav=document.createElement('span');qav.className='sp-web-qa-icon sp-web-qa-question-icon';const qsrc=ahakoAvatarSrc(qu.iconPreset);if(qsrc){const qi=document.createElement('img');qi.src=qsrc;qi.alt='';qav.appendChild(qi);}else qav.textContent=String(qu.name||'質').trim().slice(0,1)||'質';const qname=document.createElement('span');qname.textContent=qu.name||'質問者';qmeta.append(qav,qname);qbox.append(qt,qb,qmeta);return qbox;};
          const makeAnswer=()=>{const ans=document.createElement('div');ans.className='sp-web-qa-answer';if(a.best)ans.classList.add('is-best');const badge=document.createElement('div');badge.className='sp-web-qa-answer-label';badge.textContent=a.best?'🏆 ベストアンサー':'回答';const tx=document.createElement('div');tx.className='sp-web-qa-answer-text';tx.textContent=a.deleted?'この回答は削除されました':String(scene.text||'');const meta=document.createElement('div');meta.className='sp-web-qa-meta';meta.textContent=`${a.name||'回答者'}${Number(a.good)>0?'  GOOD '+Number(a.good):''}`;ans.append(badge,tx,meta);return ans;};
          if(kind==='question')wrap.appendChild(makeQuestion());else if(kind==='answer'){if(a.best)wrap.appendChild(makeQuestion());wrap.appendChild(makeAnswer());}else{const qaPrev=qaIndex>0?this.document.scenes[qaIndex-1]:null,qaFirst=!qaPrev||qaPrev?.presentation?.view!=='web-qa';if(qaFirst)wrap.appendChild(makeQuestion());wrap.appendChild(makeAnswer());}
          body.appendChild(wrap);item.append(num,body);fragment.appendChild(item);continue;
        }

        if (historyPresentation.view === 'web-notification') {
          item.classList.add('sp-history-web-notification');
          const m=historyPresentation.webNotification||{},card=document.createElement('div');card.className='sp-web-notification-card';
          const icon=document.createElement('div');icon.className='sp-web-notification-icon';const iconSrc=m.icon||ahakoAvatarSrc(m.iconPreset);if(iconSrc){const img=document.createElement('img');img.src=iconSrc;img.alt='';icon.appendChild(img);}else icon.textContent=({social:'💬',mail:'✉',system:'⚙',message:'●',other:'🔔'})[m.kind]||'🔔';
          const content=document.createElement('div');content.className='sp-web-notification-content';
          const head=document.createElement('div');head.className='sp-web-notification-head';const source=document.createElement('strong');source.textContent=m.source||'通知';head.appendChild(source);const tm=this._logTimeText(scene,historyPresentation);if(tm){const time=document.createElement('span');time.className='sp-web-notification-time';time.textContent=tm;head.appendChild(time);}
          const title=document.createElement('div');title.className='sp-web-notification-title';title.textContent=m.title||'お知らせ';
          const tx=document.createElement('div');tx.className='sp-web-notification-text';tx.textContent=String(scene.text||'');
          content.append(head,title,tx);card.append(icon,content);body.appendChild(card);item.append(num,body);fragment.appendChild(item);continue;
        } else
        if (historyPresentation.view === 'web-mail') {
          item.classList.add('sp-history-web-mail');
          const m=historyPresentation.webMail||{},wrap=document.createElement('div');
          wrap.className='sp-web-mail-card'+(m.folder==='draft'?' is-open':'');
          const summary=document.createElement('button');summary.type='button';summary.className='sp-web-mail-summary';
          const sav=document.createElement('span');sav.className='sp-web-mail-summary-avatar';const ssrc=m.icon||ahakoAvatarSrc(m.iconPreset);if(ssrc){const si=document.createElement('img');si.src=ssrc;si.alt='';sav.appendChild(si);}else sav.textContent=String(m.senderName||'差').trim().slice(0,1)||'差';
          const smain=document.createElement('span');smain.className='sp-web-mail-summary-main';const swho=document.createElement('strong');swho.textContent=(m.folder==='sent'||m.folder==='draft')?(`To: ${String(m.to||'宛先未設定')}`):(m.senderName||'差出人');const ssub=document.createElement('span');ssub.textContent=m.subject||'件名なし';smain.append(swho,ssub);
          const smeta=document.createElement('span');smeta.className='sp-web-mail-summary-meta';const stm=this._logTimeText(scene,historyPresentation);if(m.attachmentName){const clip=document.createElement('span');clip.textContent='📎';smeta.appendChild(clip);}const sstar=document.createElement('span');sstar.className='sp-web-mail-star';sstar.textContent=m.starred?'★':'☆';if(m.starred)sstar.style.color='#e5b20a';smeta.appendChild(sstar);if(stm){const stime=document.createElement('span');stime.textContent=stm;smeta.appendChild(stime);}summary.append(sav,smain,smeta);
          const detail=document.createElement('div');detail.className='sp-web-mail-detail';
          const top=document.createElement('div');top.className='sp-web-mail-top';const folder=document.createElement('span');folder.className='sp-web-mail-folder';folder.textContent=({inbox:'受信',sent:'送信済み',draft:'下書き',spam:'迷惑メール'})[m.folder]||'受信';const star=document.createElement('span');star.className='sp-web-mail-star';star.textContent=m.starred?'★':'☆';if(m.starred)star.style.color='#e5b20a';const time=document.createElement('span');time.className='sp-web-mail-time';time.textContent=stm||'';top.append(folder,star,time);
          const subject=document.createElement('div');subject.className='sp-web-mail-subject';subject.textContent=m.subject||'件名なし';
          const identity=document.createElement('div');identity.className='sp-web-mail-identity';const av=document.createElement('span');av.className='sp-web-mail-avatar';if(ssrc){const img=document.createElement('img');img.src=ssrc;img.alt='';av.appendChild(img);}else av.textContent=String(m.senderName||'差').trim().slice(0,1)||'差';const who=document.createElement('div');who.className='sp-web-mail-who';const name=document.createElement('strong');name.textContent=m.senderName||'差出人';const addr=document.createElement('span');addr.textContent=m.senderAddress||'';who.append(name,addr);identity.append(av,who);
          const routes=document.createElement('div');routes.className='sp-web-mail-routes';const to=String(m.to||'').trim(),cc=String(m.cc||'').trim();if(to){const x=document.createElement('div');x.textContent='To: '+to;routes.appendChild(x);}if(cc){const x=document.createElement('div');x.textContent='CC: '+cc;routes.appendChild(x);}
          const tx=document.createElement('div');tx.className='sp-web-mail-text';tx.textContent=String(scene.text||'');
          detail.append(top,subject,identity,routes,tx);if(m.attachmentName){const att=document.createElement('div');att.className='sp-web-mail-attachment';att.textContent='📎 '+String(m.attachmentName);detail.appendChild(att);}wrap.append(summary,detail);body.appendChild(wrap);item.append(num,body);fragment.appendChild(item);
          const toggle=e=>{e.preventDefault();e.stopPropagation();wrap.classList.toggle('is-open');};summary.addEventListener('pointerdown',e=>e.stopPropagation());summary.addEventListener('click',toggle);continue;
        }

        if (historyPresentation.view === 'web-sns') {
          item.classList.add('sp-history-web-sns');
          const m=historyPresentation.webSNS||{},row=document.createElement('div');row.className='sp-web-sns-row';
          const profileUrl=(()=>{try{const u=new URL(String(m.profileUrl||''),location.href);return /^https?:$/.test(u.protocol)?u.href:'';}catch(_){return '';}})();
          const avatar=document.createElement(profileUrl?'a':'div');avatar.className='sp-web-sns-avatar';if(profileUrl){avatar.href=profileUrl;avatar.target='_blank';avatar.rel='noopener noreferrer';avatar.addEventListener('click',e=>{e.stopPropagation();if(!window.confirm('外部プロフィールを開きます。'))e.preventDefault();});}
          const src=m.icon||ahakoAvatarSrc(m.iconPreset);if(src){const img=document.createElement('img');img.src=src;img.alt='';avatar.appendChild(img);}else avatar.textContent=String(m.name||'ユ').trim().slice(0,1)||'ユ';
          const content=document.createElement('div');content.className='sp-web-sns-content';
          const head=document.createElement('div');head.className='sp-web-sns-head';
          const identity=document.createElement(profileUrl?'a':'span');identity.className='sp-web-sns-identity';if(profileUrl){identity.href=profileUrl;identity.target='_blank';identity.rel='noopener noreferrer';identity.addEventListener('click',e=>{e.stopPropagation();if(!window.confirm('外部プロフィールを開きます。'))e.preventDefault();});}
          const nm=document.createElement('strong');nm.textContent=m.name||'ユーザー';const hd=document.createElement('span');hd.className='sp-web-sns-handle';hd.textContent=m.handle||'@user';identity.append(nm,hd);head.appendChild(identity);
          const tm=this._logTimeText(scene,historyPresentation);if(tm){const time=document.createElement('span');time.className='sp-web-sns-time';time.textContent=tm;head.appendChild(time);}
          const tx=document.createElement('div');tx.className='sp-web-sns-text';tx.textContent=m.deleted?'この投稿は削除されました':String(scene.text||'');
          const metrics=document.createElement('div');metrics.className='sp-web-sns-metrics';metrics.textContent=`♡ ${Math.max(0,Number(m.likes)||0)}   ↻ ${Math.max(0,Number(m.reposts)||0)}   💬 ${Math.max(0,Number(m.replies)||0)}`;
          content.append(head,tx,metrics);row.append(avatar,content);body.appendChild(row);item.append(num,body);fragment.appendChild(item);continue;
        }
        if (historyPresentation.view === 'web-review' && (scene.text || scene.subText)) {
          item.classList.add('sp-history-web-review');
          const r=historyPresentation.webReview||{};const row=document.createElement('div');row.className='sp-web-review-row';
          const icon=document.createElement('div');icon.className='sp-web-review-icon';if(r.icon||ahakoAvatarSrc(r.iconPreset)){const img=document.createElement('img');img.src=ahakoAvatarSrc(r.iconPreset)||r.icon;img.alt='';icon.appendChild(img);}else icon.textContent=String(r.name||'ゲ').trim().slice(0,1)||'ゲ';
          const reviewBody=document.createElement('div');reviewBody.className='sp-web-review-body';const head=document.createElement('div');head.className='sp-web-review-head';const name=document.createElement('span');name.className='sp-web-review-name';name.textContent=r.name||scene.subText||'ゲスト';head.appendChild(name);
          if(r.verified){const v=document.createElement('span');v.className='sp-web-review-verified';v.textContent='確認済み';head.appendChild(v);}const stars=document.createElement('div');stars.className='sp-web-review-stars';const rating=Math.max(1,Math.min(5,Number(r.rating)||5));stars.textContent='★'.repeat(rating)+'☆'.repeat(5-rating);const tx=document.createElement('div');tx.className='sp-web-review-text';tx.textContent=String(scene.text||'');const meta=document.createElement('div');meta.className='sp-web-review-meta';const tm=this._logTimeText(scene,historyPresentation);if(tm)meta.textContent=tm;reviewBody.append(head,stars,tx,meta);row.append(icon,reviewBody);body.appendChild(row);item.append(num,body);fragment.appendChild(item);continue;
        }

        if (historyPresentation.view === 'web-comment' && (scene.text || scene.subText)) {
          item.classList.add('sp-history-web-comment');
          const c=historyPresentation.webComment||{};
          const row=document.createElement('span');row.className='sp-history-web-comment-row'+(c.replyTo?' is-reply':'');
          const icon=document.createElement('span');icon.className='sp-history-web-comment-icon';
          if(c.icon||ahakoAvatarSrc(c.iconPreset)){const img=document.createElement('img');img.src=c.icon||ahakoAvatarSrc(c.iconPreset);img.alt='';icon.appendChild(img);}else if(c.iconPreset){icon.classList.add('sp-comment-preset','is-'+String(c.iconPreset).replace(/[^a-z0-9_-]/gi,''));icon.textContent={moon:'☾',star:'✦',coffee:'●',cat:'⌁',book:'▤',leaf:'◆',night:'●',plain:'●'}[c.iconPreset]||'●';}else icon.textContent=c.iconText||'●';
          const commentBody=document.createElement('span');commentBody.className='sp-history-web-comment-body';
          const name=document.createElement('span');name.className='sp-history-web-comment-name';name.textContent=c.name||scene.subText||'名無しさん';commentBody.appendChild(name);
          const tx=document.createElement('span');tx.className='sp-history-web-comment-text';tx.textContent=this._messageStateDeleted(scene,historyPresentation)?'このコメントは削除されました':String(scene.text||'');commentBody.appendChild(tx);
          const meta=document.createElement('span');meta.className='sp-history-web-comment-meta';
          const tm=this._logTimeText(scene,historyPresentation);if(tm){const t=document.createElement('span');t.textContent=tm;meta.appendChild(t);}
          const likes=document.createElement('span');likes.textContent=`♡ ${Math.max(0,Number(c.reaction?.mode==='dynamic'?c.reaction?.end:(c.reaction?.value??c.likes))||0)}`;meta.appendChild(likes);
          if(c.replyTo){const rep=document.createElement('span');rep.textContent='返信';meta.appendChild(rep);}
          commentBody.appendChild(meta);row.append(icon,commentBody);body.appendChild(row);
        } else
        if (historyPresentation.view === 'web-board' && (scene.text || scene.subText)) {
          item.classList.add('sp-history-web-board');
          const meta=historyPresentation.webBoard||{};
          const post=document.createElement('span');post.className='sp-history-web-board-post';
          const head=document.createElement('span');head.className='sp-history-web-board-head';
          const no=meta.number!==undefined&&meta.number!==''?String(meta.number):'';
          const name=String(meta.name||scene.subText||'名無しさん');
          const date=this._logTimeText(scene,historyPresentation),uid=String(meta.userId||''),email=String(meta.email||'');
          if(no){const el=document.createElement('span');el.className='sp-history-web-board-no';el.textContent=no;head.appendChild(el);}
          const nm=document.createElement('span');nm.className='sp-history-web-board-name';nm.textContent='名前：'+name;head.appendChild(nm);
          if(email){const el=document.createElement('span');el.className='sp-history-web-board-email';el.textContent='['+email+']';head.appendChild(el);}
          if(date){const el=document.createElement('span');el.className='sp-history-web-board-date';el.textContent=date;head.appendChild(el);}
          if(uid){const el=document.createElement('span');el.className='sp-history-web-board-id';el.textContent='ID:'+uid;head.appendChild(el);}
          post.appendChild(head);
          if(meta.replyTo){const reply=document.createElement('span');reply.className='sp-history-web-board-reply';reply.textContent=this._boardReplyLabel(meta);reply.tabIndex=0;reply.setAttribute('role','button');this._bindBoardAnchor(reply,scene,meta);post.appendChild(reply);}
          if(scene.text){const tx=document.createElement('span');tx.className='sp-history-web-board-text';tx.textContent=this._messageStateDeleted(scene,historyPresentation)?'この書き込みは削除されました':scene.text;post.appendChild(tx);}
          body.appendChild(post);
        } else if (historyPresentation.view === 'chat' && (scene.text || scene.subText)) {
          item.classList.add('sp-history-chat');
          const align = historyPresentation.text?.align === 'right' ? 'right' : 'left';
          item.dataset.chatSide = align;
          const chatIndex=this.document.scenes.indexOf(scene);
          item.dataset.chatContinuation=String(this._chatContinues(this.document.scenes[chatIndex-1],scene));

          const chatRow = document.createElement('span');
          chatRow.className = 'sp-history-chat-row';

          const icon = document.createElement('span');
          icon.className = 'sp-history-chat-icon';
          const iconSrc = this._chatIconSource(historyPresentation);
          if (iconSrc) {
            const img = this._chatIconImage(iconSrc);
            icon.appendChild(img);
          } else {
            icon.textContent = historyPresentation.chat?.iconText || '●';
          }

          const chatBody = document.createElement('span');
          chatBody.className = 'sp-history-chat-body';

          if (scene.subText) {
            const speaker = document.createElement('span');
            speaker.className = 'sp-history-chat-speaker';
            speaker.textContent = scene.subText;
            this._applyTextStyle(speaker, historyPresentation.subText || {}, true);
            chatBody.appendChild(speaker);
          }

          const historyChatCancelled=this._messageStateDeleted(scene,historyPresentation);
          let historyBubbleLine=null;
          if (scene.text && !historyChatCancelled) {
            historyBubbleLine=document.createElement('span');historyBubbleLine.className='sp-history-chat-bubble-line';
            const bubble = document.createElement('span');
            bubble.className = 'sp-history-chat-bubble';
            if (historyPresentation.chat?.bubbleColor) {
              bubble.style.background = historyPresentation.chat.bubbleColor;
            }

            const text = document.createElement('span');
            text.className = 'sp-history-chat-text';
            text.textContent = chatDisplayText(scene.text);
            this._applyTextStyle(text, historyPresentation.text || {}, false);
            if (historyPresentation.chat?.bubbleTextColor) {
              text.style.setProperty('color', String(historyPresentation.chat.bubbleTextColor), 'important');
            }
            bubble.appendChild(text);
            historyBubbleLine.appendChild(bubble);
          }
          const historyChatTime=this._chatTimeParts(scene,historyPresentation);
          if(!historyChatCancelled && historyChatTime.time){
            const meta=document.createElement('span');meta.className='sp-history-chat-meta';
            if(align==='right' && this._chatReadMode(scene,historyPresentation)!=='none' && this._chatReadVisible(scene,historyPresentation)){const read=document.createElement('span');read.className='sp-history-chat-read';read.textContent='既読';meta.appendChild(read);}
            const tm=document.createElement('span');tm.className='sp-history-chat-time';tm.textContent=historyChatTime.time;meta.appendChild(tm);
            if(historyBubbleLine)historyBubbleLine.appendChild(meta);else chatBody.appendChild(meta);
          }
          if(historyBubbleLine)chatBody.appendChild(historyBubbleLine);
          if(historyChatCancelled){
            const cancelled=document.createElement('span');
            cancelled.className='sp-history-chat-cancelled-message';
            cancelled.textContent='メッセージの送信を取り消しました';
            cancelled.style.cssText='display:block;font-size:12px;line-height:1.5;color:rgba(120,120,120,.78);font-weight:400;text-align:center;padding:5px 10px;';
            chatBody.appendChild(cancelled);
            chatRow.appendChild(chatBody);
          }else{
            chatRow.append(icon, chatBody);
          }
          body.appendChild(chatRow);
        } else if (scene.type === 'sound' && !scene.text) {
          const mark = document.createElement('span');
          mark.className = 'sp-history-text';
          mark.textContent = '♪';
          body.appendChild(mark);
        } else {
          const text = document.createElement('span');
          text.className = 'sp-history-text';
          text.textContent = scene.text || '';
          // History is still a navigator, but typography should identify the
          // actual Scene the author is reviewing.
          this._applyTextStyle(text, scene.presentation?.text || {}, false);
          body.appendChild(text);

          if (scene.subText) {
            const sub = document.createElement('span');
            sub.className = 'sp-history-subtext';
            sub.textContent = scene.subText;
            this._applyTextStyle(sub, scene.presentation?.subText || {}, true);
            body.appendChild(sub);
          }
        }

        this._appendSceneImage(body, scene, historyPresentation, { history:true });

        item.append(num, body);
        fragment.appendChild(item);
      }
      this.els.historyList.appendChild(fragment);
      // Measure the drum once after rebuilding it. Scroll-time depth updates can
      // then use cached centers instead of forcing layout for every Scene.
      this.historyMetrics = null;
      this.historyDepthItems.clear();
    }

    _scheduleHistoryDepth() {
      if (this.historyScrollRaf) return;
      this.historyScrollRaf = requestAnimationFrame(() => {
        this.historyScrollRaf = 0;
        this._updateHistoryDepth();
      });
    }

    _updateHistoryDepth() {
      if (!this.historyOpen) return;
      const scroll = this.els.historyScroll;
      const items = Array.from(this.els.historyList.querySelectorAll('.sp-history-item'));
      if (!items.length) return;

      // Building this cache may read layout once, when History opens/rebuilds.
      // The hot scroll path below does not call getBoundingClientRect() per Scene.
      if (!this.historyMetrics || this.historyMetrics.length !== items.length) {
        this.historyMetrics = items.map((item) => ({
          item,
          center: item.offsetTop + item.offsetHeight / 2
        }));
      }

      const metrics = this.historyMetrics;
      const center = scroll.scrollTop + scroll.clientHeight / 2;

      // Binary-search the nearest cached Scene center.
      let lo = 0, hi = metrics.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (metrics[mid].center < center) lo = mid + 1;
        else hi = mid;
      }
      let nearestIndex = lo;
      if (nearestIndex > 0 && Math.abs(metrics[nearestIndex - 1].center - center) <= Math.abs(metrics[nearestIndex].center - center)) {
        nearestIndex -= 1;
      }

      // Only the small visible neighbourhood needs the drum depth effect.
      // Clear the previously touched nodes, then update roughly ±6 Scenes.
      this.historyDepthItems.forEach((item) => {
        item.style.removeProperty('--sp-history-depth');
        item.classList.remove('is-nearest');
      });
      this.historyDepthItems.clear();

      const radius = 6;
      const start = Math.max(0, nearestIndex - radius);
      const end = Math.min(metrics.length - 1, nearestIndex + radius);
      const depthRange = Math.max(1, scroll.clientHeight * 0.58);
      for (let i = start; i <= end; i += 1) {
        const entry = metrics[i];
        const distance = Math.abs(entry.center - center);
        const normalized = clamp(distance / depthRange, 0, 1);
        entry.item.style.setProperty('--sp-history-depth', String(normalized));
        if (i === nearestIndex) entry.item.classList.add('is-nearest');
        this.historyDepthItems.add(entry.item);
      }
    }

    refreshCurrent(options = {}) {
      const nextDocument = options.document || null;
      if (nextDocument) this.document = nextDocument;
      if (!this.document || !this.document.scenes?.length) return false;
      this.refreshDocumentChrome();

      let nextIndex = options.index == null ? this.index : Number(options.index);
      if (!Number.isFinite(nextIndex)) nextIndex = this.index;
      nextIndex = Math.max(0, Math.min(nextIndex, this.document.scenes.length - 1));

      this._clearAutoTimer();
      this._resetPresentationRuntime();
      this._resetBackgroundRuntime();
      this.ended = false;
      if (this.els?.ending) this.els.ending.hidden = true;
      this.index = nextIndex;
      this.maxVisitedIndex = Math.max(this.maxVisitedIndex, nextIndex);
      // Authoring may mutate the current Scene's background while retaining the
      // same document object. Keep earlier prefixes, invalidate this Scene onward.
      if (this._backgroundStateCacheDocument !== this.document) {
        this._backgroundStateCacheDocument = this.document;
        this._backgroundStateCache = [];
      } else if (Array.isArray(this._backgroundStateCache)) {
        this._backgroundStateCache.length = Math.min(this._backgroundStateCache.length, nextIndex);
      }

      // Live-authoring refresh: redraw the current Scene through the real Player
      // renderer and replay its presentation immediately, but do not seek/restart
      // persistent audio unless the caller explicitly asks for it.
      this._audioRenderMode = options.preserveAudio === false ? 'restore' : 'preview';
      this._render();
      emit(this.host, 'sceneplayer:refresh', {
        index: this.index,
        scene: this.currentScene,
        preserveAudio: options.preserveAudio !== false
      });
      return true;
    }

    goToVisited(sceneOrIndex) {
      if (!this.document) return false;
      let nextIndex = -1;
      if (typeof sceneOrIndex === 'number') nextIndex = sceneOrIndex;
      else if (typeof sceneOrIndex === 'string') nextIndex = this.document.scenes.findIndex((s) => s.id === sceneOrIndex);
      if (nextIndex < 0 || nextIndex > (this.options.historyAllScenes ? this.document.scenes.length - 1 : this.maxVisitedIndex)) return false;
      return this.goTo(nextIndex, { audioMode: 'history' });
    }

    goTo(sceneOrIndex, options = {}) {
      if (!this.document) return false;
      let nextIndex = -1;
      if (typeof sceneOrIndex === 'number') nextIndex = sceneOrIndex;
      else if (typeof sceneOrIndex === 'string') nextIndex = this.document.scenes.findIndex((s) => s.id === sceneOrIndex);
      if (nextIndex < 0 || nextIndex >= this.document.scenes.length) return false;

      this._clearAutoTimer();
      this._resetPresentationRuntime();
      this._resetBackgroundRuntime();
      this.ended = false;
      this.els.ending.hidden = true;
      this.index = nextIndex;
      this._audioRenderMode = options.audioMode === 'history' ? 'history' : 'restore';
      this._render();
      emit(this.host, 'sceneplayer:scenechange', { index: this.index, scene: this.currentScene, direction: 'jump' });
      return true;
    }

    showCover(options = {}) {
      if (!this.document || !this.els?.cover) return false;
      if (options.restart) {
        // A completed reading can leave the swipe/click guard armed on iOS.
        // Returning to Cover starts a genuinely fresh input session.
        this.suppressNextClick = false;
        this._finishVisibleEntranceEffects();
        this._clearAutoTimer();
        this._resetPresentationRuntime();
        this._resetChatReadRuntime();
        this._resetBackgroundRuntime();
        this._stopAllAudio(true);
        this.audioPlaybackArmed = false;
        this.index = 0;
        this.maxVisitedIndex = 0;
        this.closeHistory({ keepVisualState: true });
        this.ended = false;
        this.els.ending.hidden = true;
        this._audioRenderMode = 'restore';
        this._render();
      }
      this.refreshDocumentChrome();

      // Public Player parity:
      // Cover can be reopened/re-rendered after load, so explicitly reapply
      // authored per-field typography here as well. This prevents CSS defaults
      // from restoring the original cover sizes after publication.
      const coverStyles=this.document.cover?.styles||{};
      const coverSizeScale={small:.78,normal:1,large:1.28,xl:1.6};
      const coverFontMap={
        serif:'var(--sp-font-serif)',
        sans:'var(--sp-font-sans)',
        mono:'var(--sp-font-mono)'
      };
      const coverStyleTargets=[
        [this.els.coverTitle,'title'],
        [this.els.coverSubtitle,'subtitle'],
        [this.els.coverAuthor,'author'],
        [this.els.coverEpisode,'episode'],
        [this.els.coverEpisodeTitle,'episodeTitle']
      ];
      for(const [el,key] of coverStyleTargets){
        if(!el)continue;
        const st=coverStyles[key]||{};
        el.style.removeProperty('font-size');
        el.style.removeProperty('font-family');
        el.style.removeProperty('color');
        const baseSize=parseFloat(getComputedStyle(el).fontSize)||16;

        if(st.color){
          el.style.setProperty('color',String(st.color),'important');
        }
        if(st.size && st.size!=='auto'){
          const resolved=typeof st.size==='number'
            ? Number(st.size)
            : baseSize*(coverSizeScale[String(st.size)]||1);
          if(Number.isFinite(resolved))el.style.setProperty('font-size',`${resolved}px`,'important');
        }
        if(st.fontFamily && st.fontFamily!=='inherit'){
          const family=coverFontMap[String(st.fontFamily)];
          if(family)el.style.setProperty('font-family',family,'important');
        }
      }

      const cover=this.document.cover||{};
      const src=String(cover.src||cover.url||cover.image||'').trim();
      if(this.els.coverBg){
        this.els.coverBg.style.backgroundImage=src?`url("${src.replace(/"/g,'\\"')}")`:'none';
        this.els.coverBg.style.backgroundSize=cover.fit==='contain'?'contain':'cover';
        const viewportWidth=Math.max(1,Number(this.host?.clientWidth)||Number(global.innerWidth)||1),viewportHeight=Math.max(1,Number(this.host?.clientHeight)||Number(global.innerHeight)||1),coverDevice=Math.min(viewportWidth,viewportHeight)<=600?'phone':viewportWidth>=1100?'pc':'tablet';
        this.els.coverBg.style.backgroundPosition=cover.positions?.[coverDevice]||cover.position||'center center';
      }
      const coverText=this.document.cover?.text||{}; // legacy fallback only
      const visibility=this.document.cover?.visibility||{};
      const coverValue=(key,fallback='')=>{
        const clean=String(fallback??'');
        if(clean.trim() && !(key==='title'&&clean.trim()==='Untitled'))return clean;
        return Object.prototype.hasOwnProperty.call(coverText,key)?String(coverText[key]??''):'';
      };
      const coverVisible=(key,value)=>{
        if(Object.prototype.hasOwnProperty.call(visibility,key))return visibility[key]!==false&&Boolean(String(value||'').trim());
        if(Object.prototype.hasOwnProperty.call(coverText,key)&&String(coverText[key]??'')==='')return false;
        return Boolean(String(value||'').trim());
      };
      const logoSrc=String(this.document.cover?.logo?.src||'').trim();
      if(this.els.coverLogo){this.els.coverLogo.src=logoSrc;this.els.coverLogo.hidden=!logoSrc;}
      if(this.els.coverAuthor){const author=coverValue('author',this.document.author||'');this.els.coverAuthor.textContent=author;this.els.coverAuthor.hidden=!coverVisible('author',author);}
      if(this.els.coverEpisode){const ep=coverValue('episode',this.document.metadata?.episode||this.document.episode||'');this.els.coverEpisode.textContent=ep;this.els.coverEpisode.hidden=!coverVisible('episode',ep);}
      if(this.els.coverEpisodeTitle){const epTitle=coverValue('episodeTitle',this.document.metadata?.episodeTitle||this.document.episodeTitle||'');this.els.coverEpisodeTitle.textContent=epTitle;this.els.coverEpisodeTitle.hidden=!coverVisible('episodeTitle',epTitle);}
      if(this.els.coverTitle){const title=coverValue('title',this.document.title||'');this.els.coverTitle.textContent=title;this.els.coverTitle.hidden=Boolean(logoSrc)||!coverVisible('title',title);}
      if(this.els.coverSubtitle){const sub=coverValue('subtitle',this.document.metadata?.subtitle||this.document.subtitle||'');this.els.coverSubtitle.textContent=sub;this.els.coverSubtitle.hidden=!coverVisible('subtitle',sub);}
      this.els.cover.hidden=false;
      this.host.classList.add('sp-cover-open');
      return true;
    }

    _beginFromCover(startEvent) {
      if(!this.document || !this.els?.cover)return false;
      // Cover -> Scene 1 must always re-arm navigation as well as audio.
      // Without this reset a synthetic click suppressed at the end of the first
      // read could consume the first input of the second read and leave the
      // restarted Player apparently frozen while Scene 1 SE still played.
      this.suppressNextClick = false;
      this.ended = false;
      this._endingAudioStarted = false;
      this.unlockAudio(true);
      // V2.15 iOS: authorize EVERY real source synchronously from this START
      // gesture and keep the elements silently playing. Scene changes merely
      // seek/unmute those already-authorized elements.
      if (this._iosStableMediaBank) this._primeIOSMediaBank();
      this.els.cover.hidden=true;
      this.host.classList.remove('sp-cover-open');
      // Treat the first render after the cover as a fresh load so Scene 1
      // one-shot SE is queued/played from the same trusted start gesture.
      // `restore` only reconstructs persistent BGM/Ambient and intentionally
      // skips one-shots, which made Scene 1 SE silent.
      this._audioRenderMode='load';
      this.playbackTimelineStartedAt=performance.now();
      this._render();
      // A work may start directly in its comic viewer. Open the first Scene's
      // image from the same trusted cover gesture so iOS Safari keeps the action
      // attached to the user's tap. Works without a usable image fall back to Scene.
      if(this.document?.cover?.startMode==='comic'){
        const firstImage=this.els?.stage?.querySelector('.sp-scene.is-active .sp-scene-image');
        firstImage?._sceneImageOpenForReading?.(startEvent);
      }
      // V112 — keyboard reading starts immediately after START. Do not require
      // an extra click on the Scene just to move focus from the Cover controls.
      this.els?.stage?.focus?.({preventScroll:true});
      requestAnimationFrame(()=>this.els?.stage?.focus?.({preventScroll:true}));
      emit(this.host,'sceneplayer:coverstart',{document:this.document,index:this.index,at:this.playbackTimelineStartedAt});
      return true;
    }

    // External shells (Public Player / future Local Player) can own their own
    // cover UI while still starting Core from the same trusted user gesture.
    begin() {
      return this._beginFromCover();
    }

    restart() {
      if (!this.document) return;
      this._finishVisibleEntranceEffects();
      this._clearAutoTimer();
      this._resetPresentationRuntime();
      this._resetChatReadRuntime();
      this._resetBackgroundRuntime();

      // Restart means a fresh reading session, not an immediate audio restart.
      // Stop current audio, clear old queued work, disarm playback, then rebuild
      // scene-1 audio as pending until the reader taps the stage again.
      this._stopAllAudio(true);
      this.audioPlaybackArmed = false;
      this._endingAudioStarted = false;

      this.index = 0;
      this.maxVisitedIndex = 0;
      this.closeHistory({ keepVisualState: true });
      this.ended = false;
      this.els.ending.hidden = true;
      this._audioRenderMode = 'restore';
      this._render();
      this.showCover();
      emit(this.host, 'sceneplayer:restart', { scene: this.currentScene });
    }

    _playEndingAudio() {
      if (this._endingAudioStarted) return false;
      const commands = Array.isArray(this.document?.ending?.audio) ? this.document.ending.audio : [];
      const playable = commands.filter((command) => command?.channel === 'oneshot' && command?.src && ['play','start'].includes(command.action || 'play'));
      if (!playable.length) return false;
      this._endingAudioStarted = true;

      // V2.18 iOS: use exactly the same live-media one-shot bank that already
      // works for Scene 1 / Scene 2 SE. The ending source was added to that bank
      // during load() and primed in the trusted START/AUTO gesture, so finish()
      // performs only seek + gate-open on an already-playing stable element.
      if (this._iosStableMediaBank) {
        const command = {
          ...playable[0],
          src: this._resolveCoreAudioSrc(playable[0].src),
          action: 'play',
          role: 'ending-se'
        };
        if (this._playIOSBankOneShot(command)) return true;

        // Keep the dedicated element only as a diagnostic last resort. It is no
        // longer the primary iPhone path because device testing showed that its
        // muted long-running playback could stay silent when reopened at ending.
        emit(this.host, 'sceneplayer:endingbankmiss', { src: command.src });
      }

      playable.forEach((item) => this._playOneShot({
        ...item,
        src: this._resolveCoreAudioSrc(item.src),
        action: 'play',
        role: 'ending-se'
      }));
      return true;
    }

    finish() {
      if (!this.document || this.ended) return;
      this.stopAuto();
      this._resetPresentationRuntime();
      this._resetBackgroundRuntime();
      this.ended = true;
      this.els.ending.classList.remove('is-visible');
      this.els.ending.hidden = false;
      this._playEndingAudio();

      // Match the Public Player ending timing:
      // - ending copy begins its own 280ms-delayed fade immediately
      // - action boxes keep their CSS 3000ms afterglow delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => this.els.ending?.classList.add('is-visible'));
      });

      emit(this.host, 'sceneplayer:end', { document: this.document, index: this.index });
    }

    setMuted(muted = true) {
      this.muted = Boolean(muted);
      if (this._iosStableMediaBank) {
        this._iosAudioBank?.forEach((entry) => {
          if (!entry?.audio) return;
          try { entry.audio.muted = this.muted || !entry.active; } catch (_) {}
          if (entry.gainNode && this.audioContext && (this.muted || !entry.active)) {
            try { entry.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime); } catch (_) { entry.gainNode.gain.value = 0; }
          }
          if (!this.muted && entry.active) this._setIOSBankEntryVolume(entry, entry.targetVolume ?? 1, 0);
        });
      }
      Object.values(this.audioEls || {}).forEach((audio) => {
        try { audio.muted = this.muted; } catch (_) {}
      });
      this.oneshots.forEach((audio) => {
        try { audio.muted = this.muted; } catch (_) {}
      });
      Object.values(this._bufferPersistent || {}).forEach((rec) => {
        if (rec?.gain) this._fadeBufferGain(rec.gain, this.muted ? 0 : (rec.volume ?? 1), 0);
      });
      (this._bufferOneShots || []).forEach((rec) => {
        const vol = clamp(asNumber(rec?.command?.volume, 1), 0, 1);
        if (rec?.gain) this._fadeBufferGain(rec.gain, this.muted ? 0 : vol, 0);
      });
      emit(this.host, 'sceneplayer:mutechange', { muted: this.muted });
      return this.muted;
    }

    toggleMuted() {
      return this.setMuted(!this.muted);
    }

    isMuted() {
      return Boolean(this.muted);
    }

    startAuto() {
      if (!this.document || this.ended || this.auto) return;
      this.unlockAudio(true);
      this.auto = true;
      this.els.auto.classList.add('is-on');
      this.els.auto.setAttribute('aria-pressed', 'true');

      // Current Scene audio is already in its proper manual state. Before AUTO
      // timers take over, silently authorize the stable BGM/Ambient/SE elements
      // that future Scenes will need. Do not schedule Scene advancement until
      // those synchronous-gesture play() attempts have settled.
      const prime = this._iosStableMediaBank
        ? this._primeIOSMediaBank()
        : (this._iosBufferAudio ? this._preloadDocumentAudioBuffers() : this._primeFutureAudioPlayback());
      Promise.resolve(prime).finally(() => {
        if (!this.auto || this.ended) return;
        this._scheduleAuto();
      });
      emit(this.host, 'sceneplayer:autochange', { auto: true });
    }

    stopAuto() {
      this.auto = false;
      this._clearAutoTimer();
      if (this.els?.auto) {
        this.els.auto.classList.remove('is-on');
        this.els.auto.setAttribute('aria-pressed', 'false');
      }
      if (this.host) emit(this.host, 'sceneplayer:autochange', { auto: false });
    }

    toggleAuto() {
      this.auto ? this.stopAuto() : this.startAuto();
    }

    _clearAutoTimer() {
      if (this.autoTimer) clearTimeout(this.autoTimer);
      this.autoTimer = null;
    }

    _scheduleAuto() {
      if (!this.auto || this.ended || !this.currentScene || this.typingState) return;
      this._clearAutoTimer();
      const cue=asNumber(this.currentScene.cueAt,NaN);
      if(!this.playbackTimelineStartedAt)this.playbackTimelineStartedAt=performance.now()-(Number.isFinite(cue)?Math.max(0,cue):0);
      const nextCue=asNumber(this.document?.scenes?.[this.index+1]?.cueAt,NaN);
      const pause=Math.max(0,asNumber(this.currentScene.pause,this.options.autoDelay));
      const targetElapsed=Number.isFinite(nextCue)?Math.max(0,nextCue):(Number.isFinite(cue)?Math.max(0,cue)+pause:NaN);
      const delay=Number.isFinite(targetElapsed)?Math.max(0,(this.playbackTimelineStartedAt+targetElapsed)-performance.now()):pause;
      this.autoTimer = setTimeout(() => {
        this.autoTimer = null;
        if (this.index >= this.document.scenes.length - 1) {
          // V2.19: open the already-primed ending-SE bank entry while AUTO's
          // audio session is still fully active. finish() then only changes UI.
          this._playEndingAudio();
          this.finish();
        } else this.next();
      }, delay);
    }


    _clearLayoutTimers() {
      this.layoutTimers.forEach((timer) => clearTimeout(timer));
      this.layoutTimers.length = 0;
    }

    _layoutTimeout(fn, delay) {
      const timer = setTimeout(() => {
        const i = this.layoutTimers.indexOf(timer);
        if (i >= 0) this.layoutTimers.splice(i, 1);
        fn();
      }, Math.max(0, delay));
      this.layoutTimers.push(timer);
      return timer;
    }

    _sceneGap(prevScene, nextScene) {
      // Consecutive chat bubbles form one speaker's message group.
      if (nextScene?.presentation?.flow !== 'horizontal' && this._chatContinues(prevScene, nextScene)) return 8;
      const prevType = prevScene?.type || 'text';
      const nextType = nextScene?.type || 'text';
      if (prevType === 'sound' || nextType === 'sound') return this.options.soundGap;
      if (prevType !== nextType) return this.options.largeGap;
      if (prevType === 'dialogue') return this.options.dialogueGap;
      return this.options.baseGap;
    }

    _measureSceneGeometry(node, stageRect) {
      node.classList.add('sp-layout-measuring');
      const nodeRect=node.getBoundingClientRect();
      const boxHeight=Math.max(1,nodeRect.height);
      const text=node.querySelector('.sp-text');
      const frame=node.querySelector('.sp-handdrawn-frame');
      const vertical=text?.dataset?.writingMode==='vertical-rl';
      let inkLeft=0,inkRight=Math.max(1,nodeRect.width),inkTop=0,inkBottom=boxHeight;
      const contentRects=[];
      const addElementRect=(element)=>{
        if(!element)return;
        const rect=element.getBoundingClientRect();
        if(rect.width>0&&rect.height>0)contentRects.push(rect);
      };
      const addTextRects=(element)=>{
        if(!element)return;
        try{
          const range=document.createRange();
          range.selectNodeContents(element);
          const rects=[...range.getClientRects()].filter(rect=>rect.width>0&&rect.height>0);
          range.detach?.();
          if(rects.length)contentRects.push(...rects);else addElementRect(element);
        }catch(_){addElementRect(element);}
      };

      // Measure the complete painted Scene. Previously only the main text or
      // frame participated in stack placement, so subtext and foreground
      // images could occupy the landing space reserved for the next Scene.
      const boardPost=node.querySelector(':scope > .sp-web-board-post');
      const chatRow=node.querySelector(':scope > .sp-chat-row');
      if(boardPost){
        // Board text is nested inside the post. Measure the complete post so
        // long responses reserve their real height before the next Scene lands.
        addElementRect(boardPost);
      }else if(chatRow){
        addElementRect(chatRow);
      }else{
        if(frame)addElementRect(frame);else addTextRects(text);
        addTextRects(node.querySelector(':scope > .sp-subtext'));
        addElementRect(node.querySelector(':scope > .sp-sound-mark'));
      }
      addElementRect(node.querySelector(':scope > .sp-scene-image > .sp-scene-image-media')||node.querySelector(':scope > .sp-scene-image'));
      if(contentRects.length){
        inkLeft=Math.min(...contentRects.map(rect=>rect.left))-nodeRect.left;
        inkRight=Math.max(...contentRects.map(rect=>rect.right))-nodeRect.left;
        inkTop=Math.min(...contentRects.map(rect=>rect.top))-nodeRect.top;
        inkBottom=Math.max(...contentRects.map(rect=>rect.bottom))-nodeRect.top;
      }
      const inkHeight=Math.max(1,inkBottom-inkTop);
      const height=vertical?Math.min(boxHeight,Math.max(48,Math.min(stageRect.height*.52,inkHeight+8))):boxHeight;
      node.classList.remove('sp-layout-measuring');
      return {height,inkLeft,inkRight,inkTop,inkBottom,inkCenterX:(inkLeft+inkRight)/2,inkCenterY:(inkTop+inkBottom)/2};
    }

    _framePosition(scene) {
      const common=scene?.presentation?.text?.position||scene?.presentation?.frame?.position||{};
      const viewportWidth=Math.max(1,Number(this.host?.clientWidth)||Number(global.innerWidth)||1);
      const source=viewportWidth>=1100&&common?.pc&&typeof common.pc==='object'?common.pc:common;
      const preset=String(source.preset||'auto');
      const presets={
        'top-left':[.18,.18],top:[.5,.18],'top-right':[.82,.18],
        left:[.18,.5],center:[.5,.5],right:[.82,.5],
        'bottom-left':[.18,.82],bottom:[.5,.82],'bottom-right':[.82,.82]
      };
      if(preset==='custom'){
        const x=Number(source.x),y=Number(source.y);
        return {preset,x:Number.isFinite(x)?Math.max(0,Math.min(1,x)):.5,y:Number.isFinite(y)?Math.max(0,Math.min(1,y)):.5};
      }
      if(presets[preset])return {preset,x:presets[preset][0],y:presets[preset][1]};
      return {preset:'auto'};
    }

    _customPositionTransform(item, position, stageWidth, stageHeight, margin) {
      const contentWidth=Math.max(1,item.node.clientWidth||item.node.getBoundingClientRect().width);
      const contentLeft=Math.max(0,(stageWidth-contentWidth)/2);
      const width=item.inkRight-item.inkLeft,height=item.inkBottom-item.inkTop;
      const centerX=width+margin*2>=stageWidth?stageWidth/2:Math.max(width/2+margin,Math.min(stageWidth-width/2-margin,stageWidth*position.x));
      const centerY=height+margin*2>=stageHeight?stageHeight/2:Math.max(height/2+margin,Math.min(stageHeight-height/2-margin,stageHeight*position.y));
      return {x:centerX-contentLeft-item.inkCenterX,y:centerY-item.inkCenterY};
    }

    _measureCarriedOverlayPositions(metrics, sceneEntries, stageWidth, stageHeight, focusY, extraGap = 0) {
      const margin=stageWidth<=600?10:16;
      const positions=metrics.map(item=>{
        const position=this._framePosition(item.scene);
        let x=0,y=focusY-item.inkCenterY-(item.scene.type==='dialogue'?12:0);
        if(position.preset!=='auto'){
          ({x,y}=this._customPositionTransform(item,position,stageWidth,stageHeight,margin));
        }
        return {x,y};
      });
      const groups=[];
      metrics.forEach((item,i)=>{const attach=i>0&&(item.scene?.presentation?.display||'stack')==='overlay';if(attach&&groups.length)groups[groups.length-1].push(i);else groups.push([i]);});
      const bounds=indices=>{const left=Math.min(...indices.map(i=>positions[i].x+metrics[i].inkLeft)),right=Math.max(...indices.map(i=>positions[i].x+metrics[i].inkRight)),top=Math.min(...indices.map(i=>positions[i].y+metrics[i].inkTop)),bottom=Math.max(...indices.map(i=>positions[i].y+metrics[i].inkBottom));return {left,right,top,bottom,centerX:(left+right)/2,centerY:(top+bottom)/2};};
      for(let g=groups.length-2;g>=0;g-=1){
        const current=groups[g],next=groups[g+1],currentBounds=bounds(current),nextBounds=bounds(next),currentLast=metrics[current[current.length-1]],nextFirst=metrics[next[0]],flow=nextFirst.scene?.presentation?.flow==='horizontal'?'horizontal':'vertical';
        let dx=0,dy=0;
        if(flow==='horizontal'){const gap=Math.max(this._sceneGap(currentLast.scene,nextFirst.scene),stageWidth*.09)+extraGap,verticalReading=nextFirst.scene?.presentation?.text?.writingMode==='vertical-rl';dx=verticalReading?nextBounds.right+gap-currentBounds.left:nextBounds.left-gap-currentBounds.right;dy=nextBounds.centerY-currentBounds.centerY;}
        else{const eitherVertical=currentLast.scene?.presentation?.text?.writingMode==='vertical-rl'||nextFirst.scene?.presentation?.text?.writingMode==='vertical-rl',gap=this._sceneGap(currentLast.scene,nextFirst.scene)+(eitherVertical?Math.max(28,Math.min(56,stageHeight*.05)):0)+extraGap;dx=0;dy=nextBounds.top-gap-currentBounds.bottom;}
        current.forEach(i=>{positions[i].x+=dx;positions[i].y+=dy;});
      }
      metrics.forEach((item,i)=>{item.node.style.visibility='';item.node.style.zIndex=String(20+i);});
      return metrics.map((item,i)=>({...item,...positions[i]}));
    }

    _measureScenePositions(nodes, sceneEntries, extraGap = 0) {
      if (!nodes.length) return [];
      const stageRect = this.els.stage.getBoundingClientRect();
      const stageHeight = stageRect.height;
      const stageWidth = Math.max(1,this.els.stage.clientWidth||stageRect.width);
      const focusRatio = global.innerWidth <= 600 ? this.options.focusYMobile : this.options.focusYDesktop;
      const focusY = stageHeight * focusRatio;

      const metrics = nodes.map((node, i) => ({
        node,
        scene: sceneEntries[i].scene,
        index: sceneEntries[i].index,
        ...this._measureSceneGeometry(node,stageRect)
      }));
      metrics.forEach(item=>{item.node.style.visibility='';item.node.style.zIndex='';});

      if(metrics.some((item,i)=>i>0&&(item.scene?.presentation?.display||'stack')==='overlay')){
        return this._measureCarriedOverlayPositions(metrics,sceneEntries,stageWidth,stageHeight,focusY,extraGap);
      }

      const newest = metrics[metrics.length - 1];
      let newestTop = focusY - newest.inkCenterY;
      if (newest.scene.type === 'dialogue') newestTop -= 12;

      const positions = new Array(metrics.length);
      positions[metrics.length - 1] = {x:0,y:newestTop};

      for (let i = metrics.length - 2; i >= 0; i -= 1) {
        const current = metrics[i];
        const next = metrics[i + 1];
        const nextPosition=positions[i+1];
        const flow=next.scene?.presentation?.flow==='horizontal'?'horizontal':'vertical';
        const eitherVertical=current.scene?.presentation?.text?.writingMode==='vertical-rl'||next.scene?.presentation?.text?.writingMode==='vertical-rl';
        if(flow==='horizontal'){
          const gap=Math.max(this._sceneGap(current.scene,next.scene),stageRect.width*.09)+extraGap;
          const verticalReading=next.scene?.presentation?.text?.writingMode==='vertical-rl';
          positions[i]={
            x:verticalReading
              ? nextPosition.x+next.inkRight+gap-current.inkLeft
              : nextPosition.x+next.inkLeft-gap-current.inkRight,
            y:nextPosition.y+next.inkCenterY-current.inkCenterY
          };
        }else{
          const verticalGap=eitherVertical?Math.max(28,Math.min(56,stageHeight*.05)):0;
          const gap=this._sceneGap(current.scene,next.scene)+verticalGap+extraGap;
          const ownPosition=this._framePosition(current.scene);
          const ownX=ownPosition.preset==='auto'?0:this._customPositionTransform(current,ownPosition,stageWidth,stageHeight,global.innerWidth<=600?10:16).x;
          positions[i]={x:ownX,y:nextPosition.y+next.inkTop-gap-current.inkBottom};
        }
      }

      const currentFrame=newest.node.querySelector('.sp-handdrawn-frame');
      if(currentFrame&&metrics.length>1)metrics.slice(0,-2).forEach(item=>{item.node.style.visibility='hidden';});
      if(currentFrame&&metrics.length>1&&this._framePosition(newest.scene).preset==='auto'){
        const previous=metrics[metrics.length-2];
        const previousFrame=previous.node.querySelector('.sp-handdrawn-frame');
        if(previousFrame){
          const flow=newest.scene?.presentation?.flow==='horizontal'?'horizontal':'vertical';
          const gap=global.innerWidth<=600?14:24;
          const currentWidth=newest.inkRight-newest.inkLeft;
          const previousWidth=previous.inkRight-previous.inkLeft;
          const currentHeight=newest.inkBottom-newest.inkTop;
          const previousHeight=previous.inkBottom-previous.inkTop;
          const availableWidth=Math.max(1,newest.node.getBoundingClientRect().width);
          const availableHeight=stageHeight*.86;
          const margin=global.innerWidth<=600?10:16;
          previous.node.style.visibility='';
          previous.node.style.zIndex='20';
          newest.node.style.zIndex='30';
          if(flow==='horizontal'){
            const verticalReading=newest.scene?.presentation?.text?.writingMode==='vertical-rl';
            const fits=currentWidth+previousWidth+gap<=availableWidth-margin*2;
            const groupWidth=currentWidth+previousWidth+gap;
            const groupLeft=(availableWidth-groupWidth)/2;
            const currentLeft=fits?(verticalReading?groupLeft:groupLeft+previousWidth+gap):(verticalReading?margin:availableWidth-margin-currentWidth);
            const previousLeft=fits?(verticalReading?groupLeft+currentWidth+gap:groupLeft):(verticalReading?availableWidth-margin-previousWidth:margin);
            const centerY=stageHeight*.48;
            positions[metrics.length-1]={x:currentLeft-newest.inkLeft,y:centerY-newest.inkCenterY};
            positions[metrics.length-2]={x:previousLeft-previous.inkLeft,y:centerY-previous.inkCenterY};
          }else{
            const fits=currentHeight+previousHeight+gap<=availableHeight;
            const groupHeight=currentHeight+previousHeight+gap;
            const groupTop=(stageHeight-groupHeight)/2;
            const previousTop=fits?groupTop:margin;
            const currentTop=fits?groupTop+previousHeight+gap:stageHeight-margin-currentHeight;
            positions[metrics.length-2]={x:availableWidth/2-previous.inkCenterX,y:previousTop-previous.inkTop};
            positions[metrics.length-1]={x:availableWidth/2-newest.inkCenterX,y:currentTop-newest.inkTop};
          }
        }
      }

      metrics.forEach((item,i)=>{
        if(i!==metrics.length-1)return;
        if(!item.node.querySelector(':scope > .sp-text, :scope > .sp-handdrawn-frame'))return;
        const position=this._framePosition(item.scene);
        if(position.preset==='auto')return;
        const margin=global.innerWidth<=600?10:16;
        positions[i]=this._customPositionTransform(item,position,stageWidth,stageHeight,margin);
      });

      if(currentFrame&&metrics.length>1){
        const previous=metrics[metrics.length-2],previousFrame=previous.node.querySelector('.sp-handdrawn-frame');
        previous.node.style.zIndex='20';newest.node.style.zIndex='30';
        if(previousFrame&&this._framePosition(newest.scene).preset!=='auto'&&this._framePosition(previous.scene).preset==='auto'){
          const availableWidth=Math.max(1,newest.node.getBoundingClientRect().width),margin=global.innerWidth<=600?10:16,flow=newest.scene?.presentation?.flow==='horizontal'?'horizontal':'vertical';
          if(flow==='horizontal'){
            const verticalReading=newest.scene?.presentation?.text?.writingMode==='vertical-rl',previousWidth=previous.inkRight-previous.inkLeft,previousLeft=verticalReading?availableWidth-margin-previousWidth:margin;
            positions[metrics.length-2]={x:previousLeft-previous.inkLeft,y:positions[metrics.length-1].y+newest.inkCenterY-previous.inkCenterY};
          }else positions[metrics.length-2]={x:availableWidth/2-previous.inkCenterX,y:margin-previous.inkTop};
        }
      }

      return metrics.map((item, i) => ({ ...item, ...positions[i] }));
    }

    _positionSceneNodes(nodes, sceneEntries, extraGap = 0) {
      const measured = this._measureScenePositions(nodes, sceneEntries, extraGap);
      measured.forEach(({ node, x, y }) => {
        node.style.transform = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;
      });
      return measured;
    }

    _positionOverlayNodes(nodes, sceneEntries) {
      if (!nodes.length) return [];
      const stageRect = this.els.stage.getBoundingClientRect();
      const stageWidth=Math.max(1,this.els.stage.clientWidth||stageRect.width),stageHeight=Math.max(1,this.els.stage.clientHeight||stageRect.height);
      const focusY = stageHeight * (stageWidth <= 520 ? .48 : .46);
      return nodes.map((node, i) => {
        const geometry=this._measureSceneGeometry(node,stageRect);
        const position=node.querySelector(':scope > .sp-text, :scope > .sp-handdrawn-frame')?this._framePosition(sceneEntries[i]?.scene):{preset:'auto'};
        let x=0,y=focusY-Math.max(1,node.getBoundingClientRect().height)/2;
        if(position.preset!=='auto'){
          ({x,y}=this._customPositionTransform({...geometry,node},position,stageWidth,stageHeight,global.innerWidth<=600?10:16));
        }
        node.style.transform = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;
        node.style.zIndex = String(20 + i);
        return { node, scene: sceneEntries[i]?.scene, x, y, height: geometry.height };
      });
    }

    _updateSceneAges(nodes, sceneEntries) {
      nodes.forEach((node, i) => {
        const distance = sceneEntries.length - 1 - i;
        node.dataset.age = String(distance);
        // Group only messages present in this stack; a solo/jump starts with an avatar.
        node.dataset.chatContinuation = String(i>0 && this._chatContinues(sceneEntries[i-1]?.scene, sceneEntries[i]?.scene));
        node.classList.toggle('is-active', distance === 0);
        if (distance > 0) node.classList.add('is-visible');
      });
    }


    _renderStackWithBreathing(visible, active) {
      const oldById = new Map(
        [...this.els.scenes.querySelectorAll('.sp-scene')].map((node) => [node.dataset.sceneId, node])
      );
      const nodes = [];
      let newestCreated = null;

      visible.forEach(({ scene, index }) => {
        let node = oldById.get(scene.id);
        if (node) {
          oldById.delete(scene.id);
        } else {
          node = this._sceneNode(scene, index === this.index, this.index - index);
          node.classList.add('entering');
          newestCreated = node;
        }
        nodes.push(node);
        this.els.scenes.appendChild(node);
      });

      oldById.forEach((node) => {
        node.classList.add('sp-layout-leaving');
        this._layoutTimeout(() => node.remove(), 430);
      });

      this._updateSceneAges(nodes, visible);

      const incomingStill = newestCreated?.dataset.entryMotion === 'still';

      // `still` is intentionally a different layout path, not a variation of the
      // Jump/Shino landing. The incoming Scene is pinned to its FINAL coordinate
      // before it is ever revealed; only older Scene nodes are allowed to travel.
      // This avoids even a single painted frame at the stage origin.
      if (incomingStill) {
        const final = this._measureScenePositions(nodes, visible, 0);
        const newestMetric = final[final.length - 1];
        if (newestMetric) {
          newestCreated.style.transition = 'none';
          newestCreated.style.transform = `translate3d(${Math.round(newestMetric.x)}px,${Math.round(newestMetric.y)}px,0)`;
          newestCreated.style.opacity = '0';
          newestCreated.style.filter = 'none';
        }

        requestAnimationFrame(() => {
          // Previous text may still move into its new stack position. The incoming
          // still Scene is deliberately excluded from every geometry transition.
          final.forEach(({node,x,y}) => {
            if (node === newestCreated) return;
            node.style.transform = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;
          });

          if (newestCreated) {
            newestCreated.classList.remove('entering');
            newestCreated.classList.add('is-visible');
            // Restore normal opacity without introducing container movement.
            newestCreated.style.opacity = '';
            newestCreated.style.filter = '';
            this._activatePresentation(active, newestCreated);
          }
          // Keep transition disabled for this entrance frame, then hand future
          // stack movement back to the normal Scene transition rules.
          requestAnimationFrame(() => {
            if (newestCreated) newestCreated.style.transition = '';
          });
          this._scheduleAuto();
        });
        return;
      }

      // IMPORTANT: faithful Jump/Shino ordering for normal `flow` entrances.
      // Leave the new Scene in its CSS entering position for one painted frame.
      // Without this frame, the incoming Scene has almost no travel distance.
      requestAnimationFrame(() => {
        this.host.classList.remove('sp-whitespace-exhale');
        this.host.classList.add('sp-whitespace-inhale');

        // Phase 1: move existing Scenes toward the expanded whitespace layout.
        if ((active?.presentation?.display || 'stack') === 'overlay') this._positionOverlayNodes(nodes, visible);
        else this._positionSceneNodes(nodes, visible, this.options.whitespaceBreath);

        // Jump/Shino wait two frames before retargeting to the final geometry.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.host.classList.remove('sp-whitespace-inhale');
            this.host.classList.add('sp-whitespace-exhale');

            // Same transform clock for both previous and current text.
            if ((active?.presentation?.display || 'stack') === 'overlay') this._positionOverlayNodes(nodes, visible);
            else this._positionSceneNodes(nodes, visible, 0);

            const newest = newestCreated || nodes[nodes.length - 1];
            if (newest) {
              newest.classList.remove('entering');
              newest.classList.add('is-visible');
              this._activatePresentation(active, newest);
            }

            this._layoutTimeout(() => this.host.classList.remove('sp-whitespace-exhale'), 860);
            this._scheduleAuto();
          });
        });
      });
    }


    _render() {
      if (!this.document) return;
      this._resetPresentationRuntime();
      this._clearLayoutTimers();

      const scenes = this.document.scenes;
      const active = scenes[this.index];
      const display = active?.presentation?.display || 'stack';
      const visible = this._visibleScenes(display);
      const isForwardStack = this._audioRenderMode === 'advance' && (display === 'stack' || display === 'overlay');

      if (isForwardStack) {
        this._renderStackWithBreathing(visible, active);
      } else {
        // Restore/load/history jumps should be immediate and deterministic.
        this.els.scenes.innerHTML = '';
        const nodes = [];
        const stillNodes = [];
        visible.forEach(({ scene, index }) => {
          const node = this._sceneNode(scene, index === this.index, this.index - index);
          // Solo/load/history uses this deterministic render path instead of the
          // forward-stack entrance path. A `still` Scene must therefore suppress
          // the Scene-container transition here as well, otherwise the browser
          // interpolates from the base translateY entrance to its measured Y and
          // it visibly drops in even though entryMotion is `still`.
          if (node.dataset.entryMotion === 'still') {
            node.style.transition = 'none';
            stillNodes.push(node);
          }
          node.classList.add('is-visible');
          this.els.scenes.appendChild(node);
          nodes.push(node);
        });
        this._updateSceneAges(nodes, visible);
        if (display === 'overlay') this._positionOverlayNodes(nodes, visible);
        else this._positionSceneNodes(nodes, visible, 0);
        const newest = nodes[nodes.length - 1];
        if (newest) this._activatePresentation(active, newest);
        if (stillNodes.length) {
          // Keep transition suppression through the first painted frame. Restore it
          // afterwards so later stack reflow/history movement behaves normally.
          requestAnimationFrame(() => requestAnimationFrame(() => {
            stillNodes.forEach((node) => { node.style.transition = ''; });
          }));
        }
      }

      this.els.current.textContent = String(this.index + 1);
      this.els.bar.style.width = `${this.progress * 100}%`;
      this.els.prev.disabled = !this.options.allowPrevious || this.maxVisitedIndex <= 0;
      this.host.dataset.display = display;
      this.host.dataset.sceneId = active.id;
      this.host.dataset.sceneType = active.type;
      this.host.dataset.sceneFlow = active.presentation?.flow==='horizontal'?'horizontal':'vertical';
      this.host.dataset.writingMode = active.presentation?.text?.writingMode==='vertical-rl'?'vertical-rl':'horizontal-tb';

      this._applyCorePresentation(active);
      this._applyBackgroundForIndex(this.index);

      if (this._audioRenderMode === 'preview') {
        // Authoring refresh leaves the currently playing transport untouched.
      } else if (this._audioRenderMode === 'cover') {
        // Cover preload: visuals only. Scene BGM / Ambient / SE must remain silent.
        this._stopAllAudio(true);
      } else if (this._audioRenderMode === 'advance') {
        this._applySceneAudio(active, false);
      } else {
        const mode = this._audioRenderMode;
        this._restoreAudioForIndex(this.index);
        if (mode === 'load') this._queueInitialOneShots(active);
      }
      this._audioRenderMode = 'advance';

      if (!isForwardStack) this._scheduleAuto();
    }

    _visibleScenes(display) {
      const scenes = this.document.scenes;
      if (display === 'solo') return [{ scene: scenes[this.index], index: this.index }];

      if (display === 'overlay') {
        let start = this.index;
        while (start > 0 && (scenes[start - 1].presentation?.display || 'stack') === 'overlay') start -= 1;
        // Keep one preceding Scene as the visual base, then accumulate overlay Scenes on it.
        if (start > 0) start -= 1;
        start = Math.max(start, this.index - this.options.maxStackVisible + 1);
        return scenes.slice(start, this.index + 1).map((scene, offset) => ({ scene, index: start + offset }));
      }

      if (scenes[this.index]?.presentation?.flow === 'horizontal') {
        const start=Math.max(0,this.index-1);
        return scenes.slice(start,this.index+1).map((scene,offset)=>({scene,index:start+offset}));
      }

      // A previous solo scene resets the visual stack, but that solo Scene itself
      // becomes the new base. Later `stack` Scenes must build on top of it.
      let start = 0;
      for (let i = this.index - 1; i >= 0; i -= 1) {
        if (scenes[i].presentation?.flow === 'horizontal') {
          start = i;
          break;
        }
        if ((scenes[i].presentation?.display || 'stack') === 'solo') {
          start = i;
          break;
        }
      }
      start = Math.max(start, this.index - this.options.maxStackVisible + 1);
      return scenes.slice(start, this.index + 1).map((scene, offset) => ({ scene, index: start + offset }));
    }


    _resetBackgroundLayers() {
      if (!this.els?.bgA || !this.els?.bgB) return;
      [this.els.bgA, this.els.bgB].forEach((layer) => {
        layer.className = layer.classList.contains('sp-bg-a') ? 'sp-bg-layer sp-bg-a' : 'sp-bg-layer sp-bg-b';
        layer.removeAttribute('style');
      });
      this.els.bgA.classList.add('is-current');
      this.els.bgB.classList.remove('is-current');
      if (this.els.veil) this.els.veil.removeAttribute('style');
      if (this.els.bgTextures) {
        this.els.bgTextures.removeAttribute('style');
        this.els.bgTextures.dataset.texture = '';
      }
      this.host.classList.remove('sp-has-background','sp-bg-glitching');
    }

    _backgroundStateAt(index) {
      const doc = this.document;
      const scenes = doc?.scenes || [];
      const target = Math.max(0, Math.min(Number(index) || 0, Math.max(0, scenes.length - 1)));

      // A different document must never inherit cached state from the old one.
      if (this._backgroundStateCacheDocument !== doc) {
        this._backgroundStateCacheDocument = doc;
        this._backgroundStateCache = [];
      }

      const cache = this._backgroundStateCache || (this._backgroundStateCache = []);
      if (cache[target]) return { ...cache[target] };

      const defaults = {
        src: '',
        transition: 'fade',
        dim: null,
        blur: 0,
        fit: 'cover',
        position: 'center center',
        reveal: null,
        motion: null,
        textures: null
      };

      // Continue from the nearest cached prefix instead of rescanning Scene 1.
      let start = 0;
      let state = { ...defaults };
      for (let i = target - 1; i >= 0; i -= 1) {
        if (cache[i]) {
          state = { ...cache[i] };
          start = i + 1;
          break;
        }
      }

      for (let i = start; i <= target; i += 1) {
        const bg = scenes[i]?.presentation?.background;
        if (bg && typeof bg === 'object') {
          Object.keys(bg).forEach((key) => {
            const value = bg[key];
            if (value !== undefined) state[key] = (value && typeof value === 'object' && !Array.isArray(value))
              ? { ...(state[key] && typeof state[key] === 'object' ? state[key] : {}), ...value }
              : value;
          });
        }
        cache[i] = { ...state };
      }
      return { ...cache[target] };
    }

    _applyBackgroundForIndex(index) {
      const next = this._backgroundStateAt(index);
      const previous = this.backgroundState;
      const sceneBg = this.document?.scenes?.[index]?.presentation?.background || null;
      const transition = sceneBg?.transition || next.transition || 'fade';
      const exit = sceneBg?.exit || 'auto';
      const srcChanged = !previous || previous.src !== next.src;
      const nextMotion = next.motion;
      const carryMotion = nextMotion?.continuity === 'carry'
        && previous?.motion?.type === nextMotion?.type
        && this.backgroundMotionEpoch > 0;
      const motionPhase = carryMotion ? Math.max(0, performance.now() - this.backgroundMotionEpoch) : 0;
      if (nextMotion?.type && nextMotion.type !== 'none' && !carryMotion) this.backgroundMotionEpoch = performance.now();
      if (!nextMotion || nextMotion.type === 'none') this.backgroundMotionEpoch = 0;

      this._resetBackgroundRuntime();
      this.backgroundState = next;
      const leavingBackground = Boolean(previous?.src) && !next.src && srcChanged;
      // Keep the outgoing layer drawable until its exit animation completes.
      this.host.classList.toggle('sp-has-background', Boolean(next.src) || leavingBackground);

      if (srcChanged) this._swapBackground(next, transition, exit, motionPhase, leavingBackground);
      else this._styleCurrentBackground(next, Boolean(sceneBg?.motion), motionPhase);

      this._applyBackgroundOverlays(next);
      this._runBackgroundReveal(sceneBg?.reveal, transition);
      emit(this.host, 'sceneplayer:backgroundchange', { index, scene: this.currentScene, background: { ...next }, srcChanged });
    }

    _currentBackgroundLayer() {
      return this.backgroundLayerIndex === 0 ? this.els.bgA : this.els.bgB;
    }

    _nextBackgroundLayer() {
      return this.backgroundLayerIndex === 0 ? this.els.bgB : this.els.bgA;
    }

    _swapBackground(state, transition, exit = 'auto', motionPhase = 0, clearHostAfter = false) {
      const current = this._currentBackgroundLayer();
      const incoming = this._nextBackgroundLayer();
      const transitionDuration=Math.min(10000,Math.max(0,asNumber(state.transitionDuration,700)));
      incoming.style.setProperty('--sp-bg-transition-duration',`${transitionDuration}ms`);
      current.style.setProperty('--sp-bg-transition-duration',`${transitionDuration}ms`);
      this._prepareBackgroundLayer(incoming, state, motionPhase);

      const mode = ['fade','cut','flash','glitch'].includes(transition) ? transition : 'fade';
      this.host.dataset.bgTransition = mode;
      incoming.classList.add('is-current');
      current.classList.remove('is-current');
      this._applyBackgroundExit(current, exit, transitionDuration);

      if (mode === 'cut') {
        incoming.classList.add('sp-bg-cut');
        requestAnimationFrame(() => incoming.classList.remove('sp-bg-cut'));
      } else if (mode === 'flash') {
        this.els.bgFlash.classList.remove('is-active');
        void this.els.bgFlash.offsetWidth;
        this.els.bgFlash.classList.add('is-active');
        this._backgroundTimeout(() => this.els.bgFlash.classList.remove('is-active'), 520);
      } else if (mode === 'glitch') {
        this.host.classList.add('sp-bg-glitching');
        this._backgroundTimeout(() => this.host.classList.remove('sp-bg-glitching'), 560);
      }

      this.backgroundLayerIndex = this.backgroundLayerIndex === 0 ? 1 : 0;
      this._styleCurrentBackground(state, true, motionPhase);
      const hasCustomExit=!['auto','fade'].includes(exit);
      this._backgroundTimeout(() => {
        current.style.backgroundImage = '';
        current.className = current.classList.contains('sp-bg-a') ? 'sp-bg-layer sp-bg-a' : 'sp-bg-layer sp-bg-b';
        if(clearHostAfter) this.host.classList.remove('sp-has-background');
      }, mode === 'cut' && !hasCustomExit ? 20 : transitionDuration+120);
    }

    _prepareBackgroundLayer(layer, state, motionPhase = 0) {
      layer.getAnimations?.().forEach(animation=>animation.cancel());
      layer.className = layer.classList.contains('sp-bg-a') ? 'sp-bg-layer sp-bg-a' : 'sp-bg-layer sp-bg-b';
      layer.style.backgroundImage = state.src ? `url("${String(state.src).replace(/"/g, '\"')}")` : 'none';
      layer.style.backgroundSize = state.fit === 'contain' ? 'contain' : 'cover';
      layer.style.backgroundPosition = state.position || 'center center';
      {
        const filters = [];
        const blur = Math.max(0, asNumber(state.blur, 0));
        const monochrome = clamp(asNumber(state.textures?.monochrome, 0), 0, 1);
        if (blur > 0) filters.push(`blur(${blur}px)`);
        if (monochrome > 0) filters.push(`grayscale(${monochrome})`);
        layer.style.filter = filters.join(' ');
      }
      this._applyBackgroundMotion(layer, state.motion, motionPhase);
    }

    _styleCurrentBackground(state, resetMotion, motionPhase = 0) {
      const layer = this._currentBackgroundLayer();
      if (!layer) return;
      layer.style.backgroundSize = state.fit === 'contain' ? 'contain' : 'cover';
      layer.style.backgroundPosition = state.position || 'center center';
      {
        const filters = [];
        const blur = Math.max(0, asNumber(state.blur, 0));
        const monochrome = clamp(asNumber(state.textures?.monochrome, 0), 0, 1);
        if (blur > 0) filters.push(`blur(${blur}px)`);
        if (monochrome > 0) filters.push(`grayscale(${monochrome})`);
        layer.style.filter = filters.join(' ');
      }
      if (resetMotion) this._applyBackgroundMotion(layer, state.motion, motionPhase);
    }

    _applyBackgroundExit(layer, exit, duration) {
      const type=['auto','fade','dark','light','blur','zoomOut','zoomIn','afterimage'].includes(exit)?exit:'auto';
      if(type==='auto'||type==='fade'||duration<=0||!layer?.animate)return;
      const computed=getComputedStyle(layer);
      const transform=computed.transform==='none'?'scale(1.001)':computed.transform;
      const filter=computed.filter==='none'?'':computed.filter;
      const addFilter=value=>`${filter} ${value}`.trim();
      let frames=[{opacity:computed.opacity||1,transform,filter:filter||'none'},{opacity:0,transform,filter:filter||'none'}];
      if(type==='dark')frames[1]={opacity:0,transform,filter:addFilter('brightness(0)')};
      if(type==='light')frames[1]={opacity:0,transform:`${transform} scale(1.015)`,filter:addFilter('brightness(2) blur(2px)')};
      if(type==='blur')frames[1]={opacity:0,transform:`${transform} scale(1.025)`,filter:addFilter('blur(14px)')};
      if(type==='zoomOut')frames[1]={opacity:0,transform:`${transform} scale(.94)`,filter:addFilter('blur(1px)')};
      if(type==='zoomIn')frames[1]={opacity:0,transform:`${transform} scale(1.09)`,filter:addFilter('blur(1px)')};
      if(type==='afterimage')frames=[
        {offset:0,opacity:computed.opacity||1,transform,filter:filter||'none'},
        {offset:.22,opacity:.92,transform:`${transform} scale(1.008)`,filter:addFilter('brightness(1.75) contrast(1.15)')},
        {offset:1,opacity:0,transform:`${transform} scale(1.025)`,filter:addFilter('brightness(.55) blur(5px)')}
      ];
      layer.animate(frames,{duration:Math.max(120,duration),easing:'cubic-bezier(.37,0,.63,1)',fill:'forwards'});
    }

    _applyBackgroundMotion(layer, motion, motionPhase = 0) {
      layer.classList.remove('sp-motion-parallax','sp-motion-breath','sp-motion-slowZoom','sp-motion-zoomOut','sp-motion-panLeft','sp-motion-panRight','sp-motion-panUp','sp-motion-panDown','sp-motion-panUpLeft','sp-motion-panUpRight','sp-motion-panDownLeft','sp-motion-panDownRight');
      layer.style.removeProperty('--sp-bg-duration');
      layer.style.removeProperty('--sp-bg-scale-from');
      layer.style.removeProperty('--sp-bg-scale-to');
      layer.style.removeProperty('--sp-bg-pan');
      layer.style.removeProperty('--sp-bg-delay');
      if (!motion || !motion.type || motion.type === 'none') return;
      const type = ['parallax','breath','slowZoom','zoomOut','panLeft','panRight','panUp','panDown','panUpLeft','panUpRight','panDownLeft','panDownRight'].includes(motion.type) ? motion.type : null;
      if (!type) return;
      layer.classList.add(`sp-motion-${type}`);
      const defaultDuration = type === 'breath' ? 4200 : 6500;
      const defaultFrom = type === 'slowZoom' ? 1.0 : (type === 'zoomOut' ? 1.08 : 1.06);
      const defaultTo = type === 'slowZoom' ? 1.14 : (type === 'zoomOut' ? 1 : (type === 'breath' ? 1.11 : 1.08));
      const duration=Math.max(250,asNumber(motion.duration,defaultDuration));
      layer.style.setProperty('--sp-bg-duration', `${duration}ms`);
      layer.style.setProperty('--sp-bg-scale-from', String(asNumber(motion.scaleFrom, defaultFrom)));
      layer.style.setProperty('--sp-bg-scale-to', String(asNumber(motion.scaleTo, defaultTo)));
      layer.style.setProperty('--sp-bg-pan', `${asNumber(motion.pan, 9)}%`);
      if(motionPhase>0){
        const phase=(type==='breath'||type==='parallax')?motionPhase%duration:Math.min(motionPhase,duration);
        layer.style.setProperty('--sp-bg-delay',`${-phase}ms`);
      }
    }

    _applyBackgroundOverlays(state) {
      const isCinemaLight = this.document?.theme === 'cinema' && this.document?.appearance?.cinemaTone === 'light';
      const sceneTone = state?.tone === 'light' ? 'light' : (state?.tone === 'dark' ? 'dark' : null);
      const useLightWash = sceneTone ? sceneTone === 'light' : isCinemaLight;
      const themeDefaultDim = this.document?.theme === 'cinema' ? (useLightWash ? 0.72 : 0.34) : (useLightWash ? 0.64 : 0);
      // Rich Text Player v0.9: the veil belongs to an actual background image.
      // Editor refreshes call this path even on paper-only Scenes; applying the
      // cinema theme default there made the whole preview suddenly dark after
      // changing font/size/background/Scene image/etc.
      const hasBackground = Boolean(state?.src);
      const dim = hasBackground ? clamp(asNumber(state.dim, themeDefaultDim), 0, 1) : 0;
      this.els.veil.style.background = useLightWash
        ? `rgba(250,247,240,${dim})`
        : `rgba(0,0,0,${dim})`;

      const textures = state.textures || {};
      const grain = clamp(asNumber(textures.grain, 0), 0, 1);
      const scanline = clamp(asNumber(textures.scanline, 0), 0, 1);
      const vignette = clamp(asNumber(textures.vignette, 0), 0, 1);
      const monochrome = clamp(asNumber(textures.monochrome, 0), 0, 1);
      const glitch = clamp(asNumber(textures.glitch, 0), 0, 1);
      const blurTexture = clamp(asNumber(textures.blur, 0), 0, 1);
      this.els.bgTextures.style.setProperty('--sp-grain', grain);
      this.els.bgTextures.style.setProperty('--sp-scanline', scanline);
      this.els.bgTextures.style.setProperty('--sp-vignette', vignette);
      this.els.bgTextures.style.setProperty('--sp-texture-glitch', glitch);
      this.els.bgTextures.style.opacity = String(Math.max(grain, scanline, vignette, glitch, blurTexture));
      this.els.bgTextures.classList.toggle('has-texture-glitch', glitch > 0);
      this.els.bgTextures.style.backdropFilter = blurTexture > 0 ? `blur(${blurTexture * 4}px) grayscale(${monochrome})` : `grayscale(${monochrome})`;
      this.els.bgTextures.style.webkitBackdropFilter = this.els.bgTextures.style.backdropFilter;
    }

    _runBackgroundReveal(reveal, fallbackTransition) {
      if (!reveal || !reveal.type || reveal.type === 'none' || reveal.type === 'still') return;
      const type = ['intro','memory','ghost','flash'].includes(reveal.type) ? reveal.type : null;
      if (!type) return;
      const layer = this._currentBackgroundLayer();
      const duration = Math.max(0, asNumber(reveal.duration, 1000));
      const hold = Math.max(0, asNumber(reveal.hold, 0));
      const opacity = clamp(asNumber(reveal.opacity, 1), 0, 1);
      layer.style.setProperty('--sp-reveal-duration', `${duration}ms`);
      layer.style.setProperty('--sp-reveal-opacity', opacity);
      layer.classList.remove('sp-reveal-intro','sp-reveal-memory','sp-reveal-ghost','sp-reveal-flash');
      void layer.offsetWidth;
      layer.classList.add(`sp-reveal-${type}`);
      this._backgroundTimeout(() => layer.classList.remove(`sp-reveal-${type}`), duration + hold + 80);
      if (type === 'flash' && fallbackTransition !== 'flash') {
        this.els.bgFlash.classList.add('is-active');
        this._backgroundTimeout(() => this.els.bgFlash.classList.remove('is-active'), Math.min(520, duration || 520));
      }
    }

    _openSceneImage(src, alt='', options={}) {
      if (!src) return;
      let viewer = document.querySelector('.sp-scene-image-viewer');
      if (!viewer) {
        viewer = document.createElement('div');
        viewer.className = 'sp-scene-image-viewer';
        viewer.hidden = true;
        viewer.setAttribute('role','dialog');
        viewer.setAttribute('aria-modal','true');

        const shade = document.createElement('div');
        shade.className = 'sp-scene-image-viewer-shade';
        shade.setAttribute('aria-hidden','true');

        const frame = document.createElement('div');
        frame.className = 'sp-scene-image-viewer-frame';

        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'sp-scene-image-viewer-close';
        close.setAttribute('aria-label','Close image');
        close.textContent = '×';

        const img = document.createElement('img');
        img.className = 'sp-scene-image-viewer-img';
        img.alt = '';

        // Custom image pan / pinch zoom.
        // Native pinch was able to enlarge the image, but the enlarged image
        // stayed visually pinned.  We keep our own transform so a zoomed image
        // can be dragged left/right/up/down on iPhone as well.
        const viewState = {
          scale: 1,
          x: 0,
          y: 0,
          startScale: 1,
          startX: 0,
          startY: 0,
          startDistance: 0,
          startCenterX: 0,
          startCenterY: 0,
          dragging: false,
          moved: false,
          lastX: 0,
          lastY: 0,
          touchStartX: 0,
          touchStartY: 0,
          touchStartTime: 0,
          lastTapTime: 0,
          lastTapX: 0,
          lastTapY: 0,
          multiTouch: false
        };

        const viewportSize = () => ({
          w: Math.max(1, frame.clientWidth),
          h: Math.max(1, frame.clientHeight)
        });

        // V106 — keep authored VIEW POINT framing and reader fullscreen freedom separate.
        // VIEW POINT starts in the V104 image-bounded viewport so portrait manga
        // keeps the same composition on phone / tablet / PC. Plain fullscreen uses
        // the whole device viewport from the start.
        const fitViewerFrame = () => {
          const host = viewer.getBoundingClientRect();
          const nw = Math.max(1, img.naturalWidth || 1);
          const nh = Math.max(1, img.naturalHeight || 1);
          const availW = Math.max(1, host.width - 28);
          const availH = Math.max(1, host.height - 36);
          const fit = Math.min(availW / nw, availH / nh);
          img.style.width = `${Math.max(1,nw*fit)}px`;
          img.style.height = `${Math.max(1,nh*fit)}px`;
          if (frame._sceneImageMode === 'viewPoint') {
            frame.style.setProperty('--sp-image-frame-w', `${Math.max(1,nw*fit)}px`);
            frame.style.setProperty('--sp-image-frame-h', `${Math.max(1,nh*fit)}px`);
            frame.classList.add('is-image-bounded');
          } else {
            frame.classList.remove('is-image-bounded');
            frame.style.removeProperty('--sp-image-frame-w');
            frame.style.removeProperty('--sp-image-frame-h');
          }
        };
        frame._fitSceneImageFrame = fitViewerFrame;
        const unlockViewPointCanvas = () => {
          if (frame._sceneImageMode !== 'viewPoint') return;
          // V108 — the moment the reader manually zooms/pans, authored VIEW POINT
          // playback yields for the rest of this open viewer. Reader inspection must
          // never snap back to an authored point after a drag.
          frame._onViewPointManualControl?.();
          frame._sceneImageMode = 'viewPointFree';
          frame.classList.remove('is-image-bounded');
          frame.style.removeProperty('--sp-image-frame-w');
          frame.style.removeProperty('--sp-image-frame-h');
        };
        frame._unlockViewPointCanvas = unlockViewPointCanvas;

        const panBounds = () => {
          const vp = viewportSize();
          const baseW = Math.max(1, img.clientWidth);
          const baseH = Math.max(1, img.clientHeight);
          const scaledW = baseW * viewState.scale;
          const scaledH = baseH * viewState.scale;

          // Keep at least one edge of the image visible at all times and never
          // allow a zoomed image to be thrown completely off-screen.
          const maxX = Math.max(0, (scaledW - vp.w) / 2);
          const maxY = Math.max(0, (scaledH - vp.h) / 2);
          return { maxX, maxY };
        };

        const clampPan = () => {
          const { maxX, maxY } = panBounds();
          viewState.x = Math.max(-maxX, Math.min(maxX, viewState.x));
          viewState.y = Math.max(-maxY, Math.min(maxY, viewState.y));
        };

        let viewAnimTimer = 0;

        const applyView = ({animate=false} = {}) => {
          clampPan();
          clearTimeout(viewAnimTimer);
          img.classList.toggle('is-animating', animate);

          img.style.transform =
            `translate3d(${viewState.x}px, ${viewState.y}px, 0) scale(${viewState.scale})`;
          frame.classList.toggle('is-zoomed', viewState.scale > 1.01);

          if (animate) {
            viewAnimTimer = setTimeout(() => {
              img.classList.remove('is-animating');
            }, 280);
          }
        };

        const resetView = ({animate=false} = {}) => {
          viewState.scale = 1;
          viewState.x = 0;
          viewState.y = 0;
          viewState.dragging = false;
          viewState.moved = false;
          applyView({animate});
        };

        const distance = (a,b) => Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
        const center = (a,b) => ({
          x:(a.clientX+b.clientX)/2,
          y:(a.clientY+b.clientY)/2
        });

        const clampScale = (s) => Math.max(1, Math.min(5, s));

        const zoomAt = (clientX, clientY, nextScale, {animate=false} = {}) => {
          const vp = viewportSize();
          const oldScale = viewState.scale;
          const scale = clampScale(nextScale);
          if (Math.abs(scale - oldScale) < 0.001) return;

          // Preserve the image point under the finger while zooming.
          const dx = clientX - vp.w / 2;
          const dy = clientY - vp.h / 2;
          const ratio = scale / oldScale;
          viewState.x = dx - (dx - viewState.x) * ratio;
          viewState.y = dy - (dy - viewState.y) * ratio;
          viewState.scale = scale;
          applyView({animate});
        };

        frame.addEventListener('touchstart',(event)=>{
          // V109 — the close control must always win over zoom/pan gestures.
          if(event.target.closest?.('.sp-scene-image-viewer-close')) return;
          if(event.touches.length===2){
            viewState.multiTouch=true;
            frame._unlockViewPointCanvas?.();
            event.preventDefault();
            const c=center(event.touches[0],event.touches[1]);
            viewState.startDistance=distance(event.touches[0],event.touches[1]);
            viewState.startScale=viewState.scale;
            viewState.startX=viewState.x;
            viewState.startY=viewState.y;
            viewState.startCenterX=c.x;
            viewState.startCenterY=c.y;
            viewState.dragging=false;
            viewState.moved=true;
          }else if(event.touches.length===1){
            if(!viewState.multiTouch)viewState.multiTouch=false;
            const t=event.touches[0];
            viewState.touchStartX=t.clientX;
            viewState.touchStartY=t.clientY;
            viewState.touchStartTime=performance.now();
            viewState.moved=false;
            if(viewState.scale>1.01){
              frame._unlockViewPointCanvas?.();
              event.preventDefault();
              viewState.dragging=true;
              viewState.lastX=t.clientX;
              viewState.lastY=t.clientY;
            }
          }
        },{passive:false});

        frame.addEventListener('touchmove',(event)=>{
          if(event.touches.length===2){
            event.preventDefault();
            const nowDistance=distance(event.touches[0],event.touches[1]);
            const c=center(event.touches[0],event.touches[1]);
            const nextScale=clampScale(
              viewState.startScale * (nowDistance / Math.max(1,viewState.startDistance))
            );
            viewState.scale=nextScale;
            viewState.x=viewState.startX + (c.x-viewState.startCenterX);
            viewState.y=viewState.startY + (c.y-viewState.startCenterY);
            viewState.moved=true;
            applyView();
          }else if(event.touches.length===1){
            const t=event.touches[0];
            const totalDx=t.clientX-viewState.touchStartX;
            const totalDy=t.clientY-viewState.touchStartY;
            if(Math.hypot(totalDx,totalDy)>10)viewState.moved=true;

            const activePages=viewer._scenePages||[];
            const activeIndex=viewer._scenePageIndex||0;
            if(viewState.scale<=1.01 && activePages.length>1 && Math.abs(totalDx)>12 && Math.abs(totalDx)>Math.abs(totalDy)*1.15){
              const direction=viewer._scenePageDirection==='rtl'?'rtl':'ltr';
              const advances=direction==='rtl'?totalDx>0:totalDx<0;
              const target=activeIndex+(advances?1:-1);
              if(target>=0&&target<activePages.length){
                if(!viewState.pageDrag){
                  const underlay=document.createElement('img');underlay.src=activePages[target].src;underlay.alt='';underlay.setAttribute('aria-hidden','true');
                  const rect=img.getBoundingClientRect(),frameRect=frame.getBoundingClientRect();
                  underlay.style.position='absolute';underlay.style.left=`${rect.left-frameRect.left}px`;underlay.style.top=`${rect.top-frameRect.top}px`;
                  underlay.style.width=`${rect.width}px`;underlay.style.height=`${rect.height}px`;underlay.style.objectFit='contain';underlay.style.maxWidth='none';underlay.style.maxHeight='none';underlay.style.margin='0';underlay.style.pointerEvents='none';underlay.style.zIndex='1';
                  frame.insertBefore(underlay,img);img.style.zIndex='2';img.style.willChange='translate';
                  const left=rect.left-frameRect.left,sign=totalDx<0?1:-1,startOffset=sign>0?frame.clientWidth-left:-(left+rect.width);viewState.pageDrag={underlay,target,sign,startOffset,width:Math.max(frame.clientWidth,rect.width)};
                }
                const drag=viewState.pageDrag;if(drag.target!==target){drag.target=target;drag.underlay.src=activePages[target].src;drag.sign=totalDx<0?1:-1;const r=img.getBoundingClientRect(),fr=frame.getBoundingClientRect(),left=r.left-fr.left;drag.startOffset=drag.sign>0?frame.clientWidth-left:-(left+r.width);}
                const dx=Math.max(-drag.width,Math.min(drag.width,totalDx));img.style.translate=`${dx}px 0`;drag.underlay.style.translate=`${drag.startOffset+dx}px 0`;event.preventDefault();
              }
            }

            if(viewState.scale>1.01){
              event.preventDefault();
              viewState.x += t.clientX-viewState.lastX;
              viewState.y += t.clientY-viewState.lastY;
              viewState.lastX=t.clientX;
              viewState.lastY=t.clientY;
              applyView();
            }
          }
        },{passive:false});

        frame.addEventListener('touchend',(event)=>{
          if(event.touches.length===0){
            const now=performance.now();
            const duration=now-viewState.touchStartTime;
            const wasMoved=viewState.moved;
            const endTouch=event.changedTouches?.[0];
            const x=endTouch?.clientX ?? viewState.touchStartX;
            const y=endTouch?.clientY ?? viewState.touchStartY;
            const vertical=y-viewState.touchStartY;

            viewState.dragging=false;

            // Horizontal swipes turn pages only at fit scale; zoomed manga remains pannable.
            const activePages=viewer._scenePages||[],activeIndex=viewer._scenePageIndex||0,draggedPage=viewState.pageDrag;
            if(draggedPage){
              const dx=x-viewState.touchStartX,commit=Math.abs(dx)>Math.max(72,Math.min(240,draggedPage.width*.32))&&Math.abs(dx)>Math.abs(vertical)*1.2&&duration<900;
              draggedPage.underlay.remove();viewState.pageDrag=null;img.style.willChange='';img.style.zIndex='';
                if(commit){const advances=viewer._scenePageDirection==='rtl'?dx>0:dx<0,target=Math.max(0,Math.min(activePages.length-1,activeIndex+(advances?1:-1)));if(target!==activeIndex){if(frame.classList.contains('is-view-rec-playing')&&viewer._sceneOnPageChange){img.style.translate='';viewer._sceneOnPageChange(target);}else{viewer._scenePageIncomingOffset=draggedPage.startOffset+dx;viewer._sceneShowPage?.(target);img.style.translate='';viewer._sceneOnPageChange?.(target);}}else img.style.translate='';}
              else img.animate?.([{translate:`${dx}px 0`},{translate:'0 0'}],{duration:260,easing:'cubic-bezier(.22,1.28,.36,1)'}).finished.catch(()=>{}).then(()=>{img.style.translate='';});
              clearTimeout(frame._viewPointTapTimer);frame._viewPointSuppressClickUntil=now+500;viewState.multiTouch=false;return;
            }
            if(!viewState.multiTouch && viewState.scale<=1.01 && activePages.length>1 && Math.abs(x-viewState.touchStartX)>78 && Math.abs(x-viewState.touchStartX)>Math.abs(vertical)*1.2 && duration<700){
              clearTimeout(frame._viewPointTapTimer);frame._viewPointSuppressClickUntil=now+500;
              const dx=x-viewState.touchStartX,advances=(viewer._scenePageDirection==='rtl'?dx>0:dx<0);
              const targetPage=Math.max(0,Math.min(activePages.length-1,activeIndex+(advances?1:-1)));
              if(targetPage!==activeIndex){if(frame.classList.contains('is-view-rec-playing')&&viewer._sceneOnPageChange)viewer._sceneOnPageChange(targetPage);else{viewer._sceneShowPage?.(targetPage);viewer._sceneOnPageChange?.(targetPage);}}
              viewState.multiTouch=false;
              return;
            }
            // Downward flick closes only at 1×, so it never fights with image panning.
            if(viewState.scale<=1.01 && !wasMoved && false){
              // reserved
            } else if(!viewState.multiTouch && viewState.scale<=1.01 && vertical>100 && vertical>Math.abs(x-viewState.touchStartX)*1.3 && duration<650){
              const closeButton=viewer.querySelector('.sp-scene-image-viewer-close');
              closeButton?.click();
              return;
            }

            // Touch double-tap: zoom around the tapped point; second double-tap resets.
            if(!wasMoved && duration<320){
              const dt=now-viewState.lastTapTime;
              const near=Math.hypot(x-viewState.lastTapX,y-viewState.lastTapY)<42;
              if(dt<340 && near && (event.target===img||event.target.closest?.('.sp-scene-image-viewer-img'))){
                event.preventDefault();clearTimeout(frame._viewPointTapTimer);frame._viewPointSuppressClickUntil=now+480;
                frame._unlockViewPointCanvas?.();
                if(viewState.scale>1.01) resetView({animate:true});
                else zoomAt(x,y,2.5,{animate:true});
                viewState.lastTapTime=0;
                return;
              }
              viewState.lastTapTime=now;
              viewState.lastTapX=x;
              viewState.lastTapY=y;
              if(frame.classList.contains('is-view-rec-playing')){
                clearTimeout(frame._viewPointTapTimer);frame._viewPointSuppressClickUntil=now+420;
                frame._viewPointTapTimer=setTimeout(()=>{if(!viewer.hidden)frame._viewPointAdvanceTouch?.();},360);
              }
            }

            if(viewState.scale<=1.01 && !frame.classList.contains('is-view-rec-playing')) resetView();
            viewState.multiTouch=false;
          }else if(event.touches.length===1 && viewState.scale>1.01){
            viewState.dragging=true;
            viewState.lastX=event.touches[0].clientX;
            viewState.lastY=event.touches[0].clientY;
          }
        },{passive:false});

        // Desktop convenience: wheel to zoom, drag to pan while zoomed.
        frame.addEventListener('wheel',(event)=>{
          if(event.target.closest?.('.sp-scene-image-viewer-close')) return;
          frame._unlockViewPointCanvas?.();
          event.preventDefault();
          const next=viewState.scale * (event.deltaY<0 ? 1.12 : 0.89);
          zoomAt(event.clientX,event.clientY,next);
          if(viewState.scale<=1.01) resetView();
        },{passive:false});

        frame.addEventListener('pointerdown',(event)=>{
          // Do not capture/prevent the pointer that belongs to the × button.
          if(event.target.closest?.('.sp-scene-image-viewer-close')) return;
          if(event.pointerType==='touch' || viewState.scale<=1.01) return;
          frame._unlockViewPointCanvas?.();
          viewState.dragging=true;
          viewState.moved=false;
          viewState.lastX=event.clientX;
          viewState.lastY=event.clientY;
          frame.setPointerCapture?.(event.pointerId);
          event.preventDefault();
        });
        frame.addEventListener('pointermove',(event)=>{
          if(!viewState.dragging || event.pointerType==='touch' || viewState.scale<=1.01) return;
          const dx=event.clientX-viewState.lastX;
          const dy=event.clientY-viewState.lastY;
          if(Math.hypot(dx,dy)>1)viewState.moved=true;
          viewState.x += dx;
          viewState.y += dy;
          viewState.lastX=event.clientX;
          viewState.lastY=event.clientY;
          applyView();
          event.preventDefault();
        });
        const endPointer=(event)=>{
          if(event.pointerType!=='touch') viewState.dragging=false;
        };
        frame.addEventListener('pointerup',endPointer);
        frame.addEventListener('pointercancel',endPointer);

        // V109 — listen on the fullscreen gesture canvas, not only the transformed image.
        // After the first desktop zoom the image can move under the pointer; keeping dblclick
        // on IMG made the second double-click unreliable. The frame is stable.
        frame.addEventListener('dblclick',(event)=>{
          if(event.target.closest?.('.sp-scene-image-viewer-close')) return;
          frame._unlockViewPointCanvas?.();
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation?.();
          if(viewState.scale>1.01) resetView({animate:true});
          else zoomAt(event.clientX,event.clientY,2.5,{animate:true});
        });

        // Tap empty black area to close at 1×. At zoom > 1 the same gesture is
        // reserved for panning, avoiding accidental dismissal.
        frame.addEventListener('click',(event)=>{
          if(frame._sceneImageMode==='viewPoint'||frame.classList.contains('is-view-rec-playing'))return;
          if(event.target===frame && viewState.scale<=1.01){
            event.preventDefault();
            event.stopPropagation();
            viewer.querySelector('.sp-scene-image-viewer-close')?.click();
          }
        });

        window.addEventListener('resize',()=>{
          // V98: iPhone changes the visual viewport when the fullscreen viewer opens.
          // The manual viewer reset must not overwrite authored VIEW REC transforms.
          if(!viewer.hidden && !frame.classList.contains('is-view-rec-playing')) applyView();
        });

        frame._sceneImageReset = () => {
          resetView();
          viewState.lastTapTime=0;viewState.lastTapX=0;viewState.lastTapY=0;
        };

        const pageControls = document.createElement('div');
        pageControls.className='sp-scene-image-viewer-pages';
        pageControls.hidden=true;
        const prevPage=document.createElement('button');prevPage.type='button';prevPage.className='sp-scene-image-viewer-page-prev';prevPage.setAttribute('aria-label','Previous page');prevPage.textContent='‹';
        const pageCount=document.createElement('span');pageCount.className='sp-scene-image-viewer-page-count';pageCount.setAttribute('aria-live','polite');
        const nextPage=document.createElement('button');nextPage.type='button';nextPage.className='sp-scene-image-viewer-page-next';nextPage.setAttribute('aria-label','Next page');nextPage.textContent='›';
        pageControls.append(prevPage,pageCount,nextPage);
        frame.append(img);
        viewer.append(shade,frame,close,pageControls);
        document.body.appendChild(viewer);

        // V110 — object continuity transition. The fullscreen viewer still owns all
        // V109 interaction logic; this only animates the boundary between the Scene
        // object and the viewer so the image feels picked up / put back.
        const sceneObjectRect = (sourceEl) => {
          const media = sourceEl?.querySelector?.('.sp-scene-image-media') || sourceEl?.closest?.('.sp-scene-image-media') || sourceEl;
          const sourceImg = media?.querySelector?.('img') || (media?.tagName === 'IMG' ? media : null);
          if (!sourceImg?.isConnected) return null;
          const r = sourceImg.getBoundingClientRect();
          if (!r.width || !r.height) return null;
          const raw = getComputedStyle(media || sourceImg).getPropertyValue('--sp-scene-image-rotation');
          const rotation = Number.parseFloat(raw) || 0;
          return {left:r.left,top:r.top,width:r.width,height:r.height,rotation,sourceImg};
        };
        const animateObjectBoundary = (from, to, {closing=false}={}) => {
          if (!from || !to || matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return Promise.resolve();
          const ghost = document.createElement('img');
          ghost.className='sp-scene-image-transition-ghost';
          ghost.src=img.currentSrc || img.src; ghost.alt='';
          document.body.appendChild(ghost);
          const key = r => ({left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`,transform:`rotate(${r.rotation||0}deg)`});
          const anim=ghost.animate([key(from),key(to)],{duration:360,easing:'cubic-bezier(.22,.74,.18,1)',fill:'forwards'});
          return anim.finished.catch(()=>{}).then(()=>ghost.remove());
        };
        viewer._sceneImageSourceEl = null;
        viewer._sceneImageOpening = false;
        viewer._sceneImageClosing = false;

        const shut = async (event) => {
          clearTimeout(frame._viewPointTapTimer);
          frame._viewPointSuppressClickUntil=0;
          frame?._viewRecCancel?.();
          viewer._sceneOutgoingPage?.remove?.();viewer._sceneOutgoingPage=null;
          event?.preventDefault?.();
          event?.stopPropagation?.();
          if (viewer._sceneImageClosing) return;
          viewer._sceneImageClosing = true;
          const source = sceneObjectRect(viewer._sceneImageCloseTargetEl || viewer._sceneImageSourceEl);
          const current = img.getBoundingClientRect();
          const from = current.width ? {left:current.left,top:current.top,width:current.width,height:current.height,rotation:0} : null;
          if (from) {
            viewer.classList.add('is-object-transitioning','is-object-closing');
            img.style.visibility='hidden';
            // Comic-start VIEW POINT intentionally opens without a pickup animation,
            // but still returns to its Scene object. If no object exists, ease the
            // image away so closing never feels like a hard cut.
            const destination=source||{left:from.left+from.width*.04,top:from.top+from.height*.04,width:from.width*.92,height:from.height*.92,rotation:0};
            await animateObjectBoundary(from,destination,{closing:true});
          }
          viewer.hidden = true;
          viewer.classList.remove('is-object-transitioning','is-object-closing');
          img.style.visibility='';
          viewer._sceneImageClosing = false;
          document.documentElement.classList.remove('sp-scene-image-open');
        };
        close.addEventListener('click',shut);
        document.addEventListener('keydown',(event)=>{
          if(viewer.hidden)return;
          if(event.key==='Escape'){shut(event);return;}
          if((event.key!=='ArrowLeft'&&event.key!=='ArrowRight')||frame._sceneImageMode==='viewPoint'||frame.classList.contains('is-view-rec-playing')||(viewer._scenePages||[]).length<2||event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
          event.preventDefault();event.stopPropagation();
          const target=Math.max(0,Math.min(viewer._scenePages.length-1,(viewer._scenePageIndex||0)+(event.key==='ArrowRight'?1:-1)));
          if(target!==(viewer._scenePageIndex||0)){viewer._sceneShowPage?.(target);viewer._sceneOnPageChange?.(target);}
        });
      }

      const img = viewer.querySelector('.sp-scene-image-viewer-img');
      const frame = viewer.querySelector('.sp-scene-image-viewer-frame');
      if (frame) frame._sceneImageMode = options?.mode === 'viewPoint' ? 'viewPoint' : 'fullscreen';
      if(options?.mode==='viewPoint')img.style.visibility=options?.viewPointStartHidden?'hidden':'';
      if(options?.mode!=='viewPoint')frame?._viewRecCancel?.();
      frame?._sceneImageReset?.();
      viewer._sceneImageSourceEl = options?.sourceEl || null;
      viewer._sceneImageCloseTargetEl = options?.closeTargetEl || options?.sourceEl || null;
      const openingSource = (()=>{
        const el=viewer._sceneImageSourceEl;
        const media=el?.querySelector?.('.sp-scene-image-media')||el?.closest?.('.sp-scene-image-media')||el;
        const si=media?.querySelector?.('img')||(media?.tagName==='IMG'?media:null);
        if(!si?.isConnected)return null; const r=si.getBoundingClientRect(); if(!r.width||!r.height)return null;
        const rotation=Number.parseFloat(getComputedStyle(media||si).getPropertyValue('--sp-scene-image-rotation'))||0;
        return {left:r.left,top:r.top,width:r.width,height:r.height,rotation};
      })();
      const pages=(Array.isArray(options?.pages)?options.pages:[]).filter(page=>page&&typeof page.src==='string'&&page.src);
      let pageIndex=Math.max(0,Math.min(pages.length-1,Number(options?.pageIndex)||0));
      viewer._scenePages=pages;viewer._scenePageDirection=options?.direction==='rtl'?'rtl':'ltr';viewer._scenePageIndex=pageIndex;
      viewer._sceneOnPageChange=options?.onPageChange;
      const pageControls=viewer.querySelector('.sp-scene-image-viewer-pages');
      let pageLoadToken=0;
      const showPage=(index)=>{
        if(!pages.length)return;
        const previousIndex=pageIndex;
        pageIndex=Math.max(0,Math.min(pages.length-1,index));
        viewer._scenePageIndex=pageIndex;
        if(pageIndex!==previousIndex){clearTimeout(frame._viewPointTapTimer);frame._viewPointSuppressClickUntil=performance.now()+420;}
        const page=pages[pageIndex];
        const nextSrc=page.src;
        const changed=img.getAttribute('src')!==nextSrc;
        const animateTurn=changed&&!viewer.hidden&&(previousIndex!==pageIndex||options?.animatePageEntry===true);
        const direction=(options?.direction==='rtl'?-1:1)*(pageIndex>=previousIndex?1:-1);
        img.alt=page.alt??alt??'';
        pageControls.hidden=pages.length<2;
        pageControls.querySelector('.sp-scene-image-viewer-page-count').textContent=`${pageIndex+1} / ${pages.length}`;
        pageControls.querySelector('.sp-scene-image-viewer-page-prev').disabled=pageIndex===0;
        pageControls.querySelector('.sp-scene-image-viewer-page-next').disabled=pageIndex===pages.length-1;
        frame?._sceneImageReset?.();
        if(changed){
          const token=++pageLoadToken;
          viewer._sceneOutgoingPage?.remove?.();viewer._sceneOutgoingPage=null;
          const outgoingShift=Number.parseFloat(img.style.translate)||0;
          let outgoing=null;
          if(animateTurn&&img.complete&&img.naturalWidth>0){
            outgoing=img.cloneNode(false);outgoing.classList.add('sp-scene-image-page-outgoing');
            outgoing.src=img.currentSrc||img.src;outgoing.alt='';outgoing.setAttribute('aria-hidden','true');
            outgoing.style.position='absolute';outgoing.style.left='50%';outgoing.style.top='50%';outgoing.style.margin='0';
            outgoing.style.width=`${Math.max(1,img.clientWidth)}px`;outgoing.style.height=`${Math.max(1,img.clientHeight)}px`;
            outgoing.style.setProperty('max-width','none','important');outgoing.style.setProperty('max-height','none','important');
            outgoing.style.transform=`translate(-50%,-50%) ${img.style.transform||'translate3d(0,0,0) scale(1)'}`;outgoing.style.zIndex='1';outgoing.style.pointerEvents='none';
            frame.appendChild(outgoing);viewer._sceneOutgoingPage=outgoing;
          }
          const finishLoad=()=>{
            if(token!==pageLoadToken)return;
            frame?._fitSceneImageFrame?.();frame?._sceneImageReset?.();
            if(animateTurn&&typeof img.animate==='function'){
              const incomingOffset=Number.isFinite(viewer._scenePageIncomingOffset)?viewer._scenePageIncomingOffset:direction*34;viewer._scenePageIncomingOffset=null;
              img.animate([{opacity:.58,translate:`${incomingOffset}px 0`},{opacity:1,translate:'0 0'}],{duration:270,easing:'cubic-bezier(.22,.74,.18,1)'});
              if(outgoing){const animation=outgoing.animate([{opacity:1,translate:`${outgoingShift}px 0`},{opacity:0,translate:`${outgoingShift-direction*34}px 0`}],{duration:270,easing:'cubic-bezier(.22,.74,.18,1)'});animation.finished.catch(()=>{}).then(()=>{outgoing.remove();if(viewer._sceneOutgoingPage===outgoing)viewer._sceneOutgoingPage=null;});}
            }else outgoing?.remove();
          };
          img.addEventListener('load',finishLoad,{once:true});
          img.addEventListener('error',()=>{if(token===pageLoadToken){outgoing?.remove();if(viewer._sceneOutgoingPage===outgoing)viewer._sceneOutgoingPage=null;}},{once:true});
          img.src=nextSrc;
        }else frame?._fitSceneImageFrame?.();
      };
      viewer._sceneShowPage=showPage;
      const prevButton=pageControls?.querySelector('.sp-scene-image-viewer-page-prev');
      const nextButton=pageControls?.querySelector('.sp-scene-image-viewer-page-next');
      if(pageControls)pageControls.hidden=pages.length<2;
      if(prevButton)prevButton.onclick=(event)=>{event.preventDefault();event.stopPropagation();showPage(pageIndex-1);options?.onPageChange?.(pageIndex);};
      if(nextButton)nextButton.onclick=(event)=>{event.preventDefault();event.stopPropagation();showPage(pageIndex+1);options?.onPageChange?.(pageIndex);};
      if(pages.length)showPage(pageIndex);else img.src = src;
        const syncBoundedFrame=()=>{frame?._fitSceneImageFrame?.();frame?._sceneImageReset?.();};
        if(img.complete&&img.naturalWidth>0)requestAnimationFrame(syncBoundedFrame);
        else img.addEventListener('load',()=>requestAnimationFrame(syncBoundedFrame),{once:true});
        if('ResizeObserver' in window){
          const ro=new ResizeObserver(()=>{if(!viewer.hidden&&img.naturalWidth>0)frame?._fitSceneImageFrame?.();});
          ro.observe(viewer);viewer._imageBoundedRO?.disconnect?.();viewer._imageBoundedRO=ro;
        }
      if(!pages.length)img.alt = alt || '';
      viewer.hidden = false;
      document.documentElement.classList.add('sp-scene-image-open');
      if (openingSource) {
        viewer.classList.add('is-object-transitioning','is-object-opening');
        img.style.visibility='hidden';
        const runOpening=()=>requestAnimationFrame(()=>requestAnimationFrame(async()=>{
          frame?._fitSceneImageFrame?.();
          const r=img.getBoundingClientRect();
          const target=r.width?{left:r.left,top:r.top,width:r.width,height:r.height,rotation:0}:null;
          if(target){
            const ghost=document.createElement('img'); ghost.className='sp-scene-image-transition-ghost'; ghost.src=img.currentSrc||img.src; ghost.alt=''; document.body.appendChild(ghost);
            const key=x=>({left:`${x.left}px`,top:`${x.top}px`,width:`${x.width}px`,height:`${x.height}px`,transform:`rotate(${x.rotation||0}deg)`});
            const a=ghost.animate([key(openingSource),key(target)],{duration:360,easing:'cubic-bezier(.22,.74,.18,1)',fill:'forwards'});
            await a.finished.catch(()=>{}); ghost.remove();
          }
          img.style.visibility=''; viewer.classList.remove('is-object-transitioning','is-object-opening');
        }));
        if(img.complete&&img.naturalWidth>0)runOpening(); else img.addEventListener('load',runOpening,{once:true});
      }
      // V116 — VIEW POINT must not leave keyboard focus on the × button.
      // Otherwise Enter is also the button's native activation key and can close
      // the viewer independently of VIEW POINT navigation.
      const focusClose = viewer.querySelector('.sp-scene-image-viewer-close');
      if (options?.mode === 'viewPoint' && frame) {
        frame.tabIndex = -1;
        frame.focus({preventScroll:true});
      } else {
        focusClose?.focus({preventScroll:true});
      }
    }

    // Phase 6 / V99 — tap-driven VIEW POINT playback.
    // The author chooses WHERE to look; the reader chooses WHEN to advance.
    _openSceneImageViewRec(image, sourceEl=null) {
      const pointSet=image?.viewPoints||image?.viewRec||null;
      const rawPoints = Array.isArray(pointSet?.points) ? pointSet.points : [];
      if (!image?.src || rawPoints.length < 1) {
        if (image?.src) this._openSceneImage(image.src, image.alt || '', {sourceEl});
        return;
      }

      const fallbackPageChange=(pageIndex)=>{
        const pages=Array.isArray(image.pages)?image.pages:[],page=pages[pageIndex];if(!page?.src)return;
        const pagePoints=page.viewPoints||page.viewRec||(pageIndex===0?(image.viewPoints||image.viewRec):null);
        if((pagePoints?.points||[]).length)this._openSceneImageViewRec({...image,...page,src:page.src,alt:page.alt??image.alt??'',viewPoints:pagePoints,pageIndex,onPageChange:fallbackPageChange,animatePageEntry:false},null);
        else this._openSceneImage(page.src,page.alt??image.alt??'',{pages,pageIndex,onPageChange:fallbackPageChange,direction:image.pageDirection||'ltr'});
      };
      const onPageChange=typeof image.onPageChange==='function'?image.onPageChange:fallbackPageChange;
      const startAtAuthoredPoint=image.startAtAuthoredPoint===true||(Number(image.pageIndex)||0)>0;
      this._openSceneImage(image.src, image.alt || '', {mode:'viewPoint', sourceEl,closeTargetEl:image.closeTargetEl||sourceEl,pages:image.pages,pageIndex:image.pageIndex,onPageChange,animatePageEntry:image.animatePageEntry===true&&!startAtAuthoredPoint,viewPointStartHidden:startAtAuthoredPoint,direction:image.pageDirection||'ltr'});
      const viewer = document.querySelector('.sp-scene-image-viewer');
      const frame = viewer?.querySelector('.sp-scene-image-viewer-frame');
      const img = viewer?.querySelector('.sp-scene-image-viewer-img');
      if (!viewer || !frame || !img) return;
      if (frame._viewRecCancel) frame._viewRecCancel();

      const sourceSpace=pointSet?.coordinateSpace==='source';
      const points = rawPoints.map(p=>{
        if(sourceSpace){
          if(p?.type==='fit')return{type:'fit'};
          if(p?.rect){
            const r=p.rect;return{type:'rect',x:Math.max(0,Math.min(.99,Number(r.x)||0)),y:Math.max(0,Math.min(.99,Number(r.y)||0)),width:Math.max(.01,Math.min(1,Number(r.width)||1)),height:Math.max(.01,Math.min(1,Number(r.height)||1)),fit:p.fit==='contain'?'contain':undefined};
          }
          return{type:'focus',cx:Number.isFinite(Number(p?.cx))?Number(p.cx):.5,cy:Number.isFinite(Number(p?.cy))?Number(p.cy):.5,width:Math.max(.01,Math.min(1,Number(p?.width)||1)),height:Math.max(.01,Math.min(1,Number(p?.height)||1)),occupancy:Number.isFinite(Number(p?.occupancy))?Math.max(1,Math.min(8,Number(p.occupancy))):null};
        }
        // V99 compatibility: old device-relative point.
        return{type:'legacy',cx:Number.isFinite(Number(p?.cx))?Number(p.cx):.5,cy:Number.isFinite(Number(p?.cy))?Number(p.cy):.5,scale:Math.max(1,Math.min(5,Number(p?.scale)||1))};
      }).map((point,i)=>({...point,transitionMs:Number.isFinite(Number(rawPoints[i]?.transitionMs))?Math.max(100,Math.min(30000,Number(rawPoints[i].transitionMs))):420,transitionCurve:['linear','ease-in','ease-in-out'].includes(rawPoints[i]?.transitionCurve)?rawPoints[i].transitionCurve:'ease-out'}));
      // V114 — keep the opening/first-point handoff separate from normal advancement.
      // V112 assigned index=0 before point 1 had actually settled. That allowed the
      // opening Enter/click to be interpreted as an advance/close. `initializing`
      // blocks progression until point 1 is visibly in place.
      let index=-1, raf=0, cancelled=false, moving=false, initializing=true;

      const coords=(gaze)=>{
        const bw=Math.max(1,img.clientWidth),bh=Math.max(1,img.clientHeight);
        if(gaze.type==='fit')return{x:0,y:0,scale:1};
        let scale=gaze.scale||1;
        if(gaze.type==='rect'){
          // V102 — source-rectangle playback. A focus view may never expose
          // outside-image black space: zoom enough to cover this viewer, then
          // center the authored source rectangle and clamp to the source edges.
          const rw=Math.max(.01,gaze.width),rh=Math.max(.01,gaze.height);
          // V107 — authored VIEW POINT stays in the bounded image viewport.
          // Resolve the recorded source rectangle against that viewport exactly as V104 did.
          // The V105 source-only scale (1/rw, 1/rh) over-amplified horizontal travel on
          // portrait manga, especially on wide desktop screens.
          let panW=bw,panH=bh;
          let rectScale;
          if(gaze.fit==='contain'){
            // Use the image's actual object-fit:contain footprint. This lets a wide
            // panel fill the viewport as much as possible while staying entirely visible.
            const fit=Math.min(frame.clientWidth/Math.max(1,img.naturalWidth||bw),frame.clientHeight/Math.max(1,img.naturalHeight||bh));
            panW=Math.max(1,(img.naturalWidth||bw)*fit);panH=Math.max(1,(img.naturalHeight||bh)*fit);
            rectScale=Math.min(frame.clientWidth/(panW*rw),frame.clientHeight/(panH*rh));
          }else{
            rectScale=Math.max(1,Math.max(frame.clientWidth/(bw*rw),frame.clientHeight/(bh*rh)));
          }
          scale=Math.max(.05,Math.min(12,rectScale));
          const cx=Math.max(0,Math.min(1,gaze.x+rw/2)),cy=Math.max(0,Math.min(1,gaze.y+rh/2));
          const rawX=(.5-cx)*panW*scale,rawY=(.5-cy)*panH*scale;
          const maxX=Math.max(0,(panW*scale-frame.clientWidth)/2),maxY=Math.max(0,(panH*scale-frame.clientHeight)/2);
          return{x:Math.max(-maxX,Math.min(maxX,rawX)),y:Math.max(-maxY,Math.min(maxY,rawY)),scale};
        }
        if(gaze.type==='focus'){
          // Resolve the authored source-image region against THIS viewer.
          // The same point therefore becomes a stronger zoom on a wide PC and
          // a gentler zoom on a narrow phone when needed to show the same region.
          const targetW=Math.max(1,bw*gaze.width),targetH=Math.max(1,bh*gaze.height);
          const regionScale=Math.max(1,Math.min(8,Math.min(frame.clientWidth/targetW,frame.clientHeight/targetH)));
          // V101 — preserve the authored visual occupancy as well as the source region.
          // A huge desktop viewport must not flatten several viewpoints into the same row view.
          // `occupancy` is the author's zoom relative to FIT, so it is device-independent.
          scale=Math.max(regionScale, gaze.occupancy||1);
        }
        const cx=Number.isFinite(gaze.cx)?gaze.cx:.5,cy=Number.isFinite(gaze.cy)?gaze.cy:.5;
        const rawX=(.5-cx)*bw*scale,rawY=(.5-cy)*bh*scale;
        const maxX=Math.max(0,(bw*scale-frame.clientWidth)/2),maxY=Math.max(0,(bh*scale-frame.clientHeight)/2);
        return{x:Math.max(-maxX,Math.min(maxX,rawX)),y:Math.max(-maxY,Math.min(maxY,rawY)),scale};
      };
      let current={x:0,y:0,scale:1};
      const apply=(v)=>{current=v;img.style.transform=`translate3d(${v.x}px, ${v.y}px, 0) scale(${v.scale})`;frame.classList.toggle('is-zoomed',v.scale>1.01);};
      const moveTo=(gaze,duration=gaze.transitionMs??420)=>{
        if(raf)cancelAnimationFrame(raf);moving=true;
        const from={...current},to=coords(gaze),started=performance.now(),ease=t=>gaze.transitionCurve==='linear'?t:gaze.transitionCurve==='ease-in'?t*t*t:gaze.transitionCurve==='ease-in-out'?(t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2):1-Math.pow(1-t,3);
        const tick=now=>{if(cancelled||viewer.hidden)return;const q=Math.max(0,Math.min(1,(now-started)/duration)),e=ease(q);apply({x:from.x+(to.x-from.x)*e,y:from.y+(to.y-from.y)*e,scale:from.scale+(to.scale-from.scale)*e});if(q<1)raf=requestAnimationFrame(tick);else{raf=0;moving=false;}};raf=requestAnimationFrame(tick);
      };
      let onViewPointKey=null,onViewPointClick=null;
      const cancel=()=>{cancelled=true;clearTimeout(frame._viewPointTapTimer);if(raf)cancelAnimationFrame(raf);raf=0;moving=false;frame._viewRecCancel=null;frame._viewPointAdvanceTouch=null;frame._onViewPointManualControl=null;frame.classList.remove('is-view-rec-playing');if(onViewPointClick)frame.removeEventListener('click',onViewPointClick,true);if(onViewPointKey)document.removeEventListener('keydown',onViewPointKey,true);};
      // Manual pinch / wheel / double-click hands the viewer to the reader completely.
      // Do not resume VIEW POINT on the synthetic click that follows a drag.
      frame._onViewPointManualControl=()=>cancel();
      const advance=(event)=>{
        const eventTarget=event?.target;
        if(cancelled||viewer.hidden||frame._sceneImageMode==='viewPointFree'||eventTarget?.closest?.('.sp-scene-image-viewer-close'))return;
        event?.preventDefault?.();event?.stopPropagation?.();event?.stopImmediatePropagation?.();
        // Do not let the key/click that opened VIEW POINT also advance or close it.
        if(initializing||moving)return;
        if(index<points.length-1){
          frame._sceneImageMode='viewPoint';
          // V109 — do not refit/rewrite the viewport between authored points.
          // Re-fitting here can force a layout/paint between two transforms and show up
          // as a one-frame flash. Opening + actual resize already perform the fit.
          index++;moveTo(points[index]);
        }
        // V116 — after the final authored point, the NEXT deliberate Enter/tap
        // closes the viewer. This is intentional VIEW POINT completion, not native
        // activation of the × button (focus is kept on the viewer frame above).
        else{
          const pages=Array.isArray(image.pages)?image.pages:[];
          const currentPage=Math.max(0,Number(image.pageIndex)||0);
          const nextIndex=currentPage+1;
          const nextPage=pages[nextIndex];
          const nextPoints=nextPage?.viewPoints||nextPage?.viewRec||null;
          if(nextPage?.src&&(nextPoints?.points||[]).length){
            const nextImage={...image,src:nextPage.src,alt:nextPage.alt??image.alt??'',viewPoints:nextPoints,pageIndex:nextIndex,animatePageEntry:true};
            cancel();
            this._openSceneImageViewRec(nextImage,null);
            return;
          }
          const closeButton=viewer.querySelector('.sp-scene-image-viewer-close');
          cancel();
          closeButton?.click();
          return;
        }
      };
      frame._viewRecCancel=cancel;frame._viewPointAdvanceTouch=()=>{if(moving){frame._viewPointTapTimer=setTimeout(()=>frame._viewPointAdvanceTouch?.(),60);return;}advance(null);};frame.classList.add('is-view-rec-playing');onViewPointClick=(event)=>{if(performance.now()<frame._viewPointSuppressClickUntil){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();return;}advance(event);};frame.addEventListener('click',onViewPointClick,true);
      // V111 — desktop keyboard parity: Enter advances VIEW POINT exactly like a tap.
      // Once the reader takes manual zoom/pan control, VIEW POINT is cancelled, so Enter
      // intentionally stops advancing as well.
      onViewPointKey=(event)=>{
        if(event.key!=='Enter'||event.repeat||cancelled||viewer.hidden||frame._sceneImageMode==='viewPointFree')return;
        advance(event);
      };
      document.addEventListener('keydown',onViewPointKey,true);

      const beginWhenReady=(attempt=0)=>{
        if(cancelled||viewer.hidden)return;
        const ready=img.naturalWidth>0&&img.clientWidth>2&&img.clientHeight>2&&frame.clientWidth>2&&frame.clientHeight>2;
        if(!ready&&attempt<24){setTimeout(()=>beginWhenReady(attempt+1),16);return;}
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          if(cancelled||viewer.hidden)return;
          frame?._fitSceneImageFrame?.();
          apply({x:0,y:0,scale:1});
          // V112 — opening VIEW POINT is itself the first step. The reader should
          // not need an extra fullscreen click before keyboard/tap progression begins.
          // Let the V110 pickup transition finish, then move straight to point 1.
          if(index<0&&points.length){
            if(startAtAuthoredPoint){index=0;apply(coords(points[0]));initializing=false;img.style.visibility='';return;}
            // Wait for the V110 pickup animation, then establish point 1 as a real
            // settled state. Only after that may Enter/tap advance to point 2.
            setTimeout(()=>{
              if(cancelled||viewer.hidden)return;
              index=0;
              moveTo(points[0]);
              const release=()=>{
                if(cancelled||viewer.hidden)return;
                if(moving){setTimeout(release,24);return;}
                initializing=false;
              };
              setTimeout(release,24);
            },380);
          }
        }));
      };
      if(img.complete&&img.naturalWidth>0)beginWhenReady();else img.addEventListener('load',()=>beginWhenReady(),{once:true});
    }

    _appendSceneImage(container, scene, presentation, { history=false } = {}) {
      const image = presentation?.image;
      const pages=Array.isArray(image?.pages)?image.pages.filter(page=>page&&typeof page.src==='string'&&page.src):[];
      const firstImage=pages[0]||image;
      const displayImage=image?.cover?.src?image.cover:firstImage;
      if (!firstImage?.src || !container) return;

      const wrap = document.createElement(history ? 'span' : 'div');
      wrap.className = history ? 'sp-history-scene-image' : 'sp-scene-image';
      wrap.dataset.showPageCount=image.showPageCount===false?'false':'true';
      if(pages.length>1||image?.cover?.src){wrap.dataset.pageCount=String(Math.max(1,pages.length));wrap.classList.add('has-page-stack');}
      wrap.dataset.imageRounded=image.rounded===false?'false':'true';
      wrap.dataset.imageSize = ['small','large'].includes(image.size)
        ? image.size
        : ((presentation?.view==='chat') ? 'small' : 'large');

      let imageAlign=image.align||((presentation?.view==='chat')?'speaker':'center');
      if(imageAlign==='speaker'){
        const speakerSide=(presentation?.text?.align==='right')?'right':'left';
        imageAlign=speakerSide;
      }
      wrap.dataset.imageAlign=['left','center','right'].includes(imageAlign)?imageAlign:'center';

      const media = document.createElement(history ? 'span' : 'div');
      media.className = history ? 'sp-history-scene-image-media' : 'sp-scene-image-media';
      // V125 — keep public Player Scene-image object styling in sync with Studio.
      // Rotation is intentionally clamped to the same authoring range used by Studio.
      const rotation = Math.max(-20, Math.min(20, Number(image.rotation) || 0));
      media.style.setProperty('--sp-scene-image-rotation', `${rotation}deg`);
      if (image.shadow === true) media.classList.add('has-object-shadow');

      const img = document.createElement('img');
      img.alt = displayImage.alt ?? firstImage.alt ?? image.alt ?? '';
      img.loading = history ? 'lazy' : 'eager';
      img.decoding = 'async';

      // On the first visit an uncached image has no intrinsic height when the
      // Scene stack is initially measured. The Player therefore centers the
      // text-only height, then the image expands downward after loading.
      // Re-measure the current stack as soon as the foreground image becomes
      // measurable. Cached/revisited Scenes already have the correct geometry.
      const relayoutAfterImageLoad = () => {
        if (history) return;
        const activeNode = wrap.closest('.sp-scene');
        if (!activeNode || !activeNode.isConnected || !activeNode.classList.contains('is-active')) return;

        const run = () => {
          const activeScene = this.document?.scenes?.[this.index];
          if (!activeScene || activeScene.id !== scene.id) return;
          const display = activeScene.presentation?.display || 'stack';
          const visible = this._visibleScenes(display);
          const nodeMap = new Map(
            [...this.els.scenes.querySelectorAll('.sp-scene')]
              .filter(node => !node.classList.contains('sp-layout-leaving'))
              .map(node => [node.dataset.sceneId, node])
          );
          const nodes = visible.map(entry => nodeMap.get(entry.scene.id)).filter(Boolean);
          if (nodes.length === visible.length) {
            if(display==='overlay')this._positionOverlayNodes(nodes,visible);
            else this._positionSceneNodes(nodes,visible,0);
          }
        };

        // Give Safari one painted frame to apply the decoded image dimensions.
        requestAnimationFrame(() => requestAnimationFrame(run));
      };

      img.addEventListener('load', relayoutAfterImageLoad, {once:true});

      // History drum centers are cached for scroll performance. Foreground
      // images can change a history item's height after that cache is built,
      // which makes the visual "focus" point drift to the wrong Scene.
      // Invalidate/rebuild the drum geometry whenever a history image resolves.
      const refreshHistoryGeometryAfterImageLoad = () => {
        if (!history) return;
        this.historyMetrics = null;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => this._scheduleHistoryDepth());
        });
      };
      img.addEventListener('load', refreshHistoryGeometryAfterImageLoad, {once:true});

      img.src = displayImage.src;
      if(pages.length>1 || image?.cover?.src){
        const backSheet=document.createElement('span');backSheet.className='scene-image-stack-sheet is-back';backSheet.setAttribute('aria-hidden','true');
        const middleSheet=document.createElement('span');middleSheet.className='scene-image-stack-sheet is-middle';middleSheet.setAttribute('aria-hidden','true');
        media.append(backSheet,middleSheet);
      }
      media.appendChild(img);

      const object = document.createElement(history ? 'span' : 'div');
      object.className = history ? 'sp-history-scene-image-object' : 'sp-scene-image-object';
      object.appendChild(media);
      let caption = null;
      const captionText=String(firstImage.alt||image.alt||'').trim();
      if (image.caption === true && captionText) {
        caption = document.createElement(history ? 'span' : 'div');
        caption.className = history ? 'sp-history-scene-image-caption' : 'sp-scene-image-caption';
        caption.textContent = captionText;
        object.appendChild(caption);
      }
      wrap.appendChild(object);

      // V89 — keep a horizontal caption clear of the lowest rotated image corner.
      // Rotation changes the visual bounding box without changing layout height,
      // so derive only the extra downward reach and add that to the normal gap.
      const updateCaptionClearance = () => {
        if (!caption) return;
        const w = media.offsetWidth || img.getBoundingClientRect().width || 0;
        const h = media.offsetHeight || img.getBoundingClientRect().height || 0;
        if (!w || !h) return;
        const rad = Math.abs(rotation) * Math.PI / 180;
        const rotatedHeight = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
        const extraBelow = Math.max(0, (rotatedHeight - h) / 2);
        object.style.setProperty('--sp-scene-image-caption-clearance', `${extraBelow.toFixed(2)}px`);
      };
      img.addEventListener('load', updateCaptionClearance, {once:true});
      if (typeof ResizeObserver !== 'undefined' && caption) {
        const captionResizeObserver = new ResizeObserver(updateCaptionClearance);
        captionResizeObserver.observe(media);
      }
      requestAnimationFrame(updateCaptionClearance);

      // Data/blob/cached images can already be complete before the load event
      // is observed by this render pass.
      if (img.complete && img.naturalWidth > 0) {
        relayoutAfterImageLoad();
        refreshHistoryGeometryAfterImageLoad();
      }

      const hasViewPoints = pages.some(page => (page.viewPoints?.points || page.viewRec?.points || []).length) || (image.viewPoints?.points || image.viewRec?.points || []).length > 0;
      const imageTapAction = image.tapAction || (hasViewPoints ? 'viewRec' : pages.length > 1 ? 'fullscreen' : image.fullscreen === false ? 'none' : 'fullscreen');
      const firstViewPoints=firstImage.viewPoints||firstImage.viewRec||image.viewPoints||image.viewRec;
      const hasViewRec = imageTapAction === 'viewRec' && (firstViewPoints?.points||image.viewRec?.points)?.length > 0;
      const openBundlePage=(pageIndex,{fromScene=false,forceFullscreen=false,startAtAuthoredPoint=false}={})=>{
        const page=pages[pageIndex]||firstImage;
        const sourceEl=fromScene?wrap:null;
        const pointSet=page.viewPoints||page.viewRec||(pageIndex===0?(image.viewPoints||image.viewRec):null);
        const pageImage={...image,src:page.src,alt:page.alt??image.alt??'',viewPoints:pointSet,pages,pageIndex,onPageChange:openBundlePage,startAtAuthoredPoint,closeTargetEl:sourceEl};
        if(!forceFullscreen&&imageTapAction==='viewRec'&&(pointSet?.points||[]).length)this._openSceneImageViewRec(pageImage,startAtAuthoredPoint?null:sourceEl);
        else this._openSceneImage(page.src,page.alt??image.alt??'',{sourceEl,pages:pages.length>1?pages:undefined,pageIndex,onPageChange:openBundlePage,direction:image.pageDirection||'ltr'});
      };
      // The cover's comic-start mode opens the image even when ordinary Scene
      // tapping was disabled. Preserve authored VIEW POINT behavior when selected.
      wrap._sceneImageOpenForReading=(event)=>{
        event?.preventDefault?.();
        event?.stopPropagation?.();
        openBundlePage(0,{fromScene:true,forceFullscreen:imageTapAction!=='viewRec',startAtAuthoredPoint:true});
      };
      if (imageTapAction === 'fullscreen' || imageTapAction === 'viewRec') {
        wrap.classList.add(hasViewRec ? 'is-view-rec' : 'is-zoomable');
        wrap.setAttribute('role','button');
        wrap.setAttribute('tabindex','0');
        wrap.setAttribute('aria-label', hasViewRec
          ? (image.alt ? `Play VIEW REC: ${image.alt}` : 'Play VIEW REC')
          : (image.alt ? `Open image: ${image.alt}` : 'Open image fullscreen'));
        const open = (event) => {
          event.preventDefault();
          event.stopPropagation();
          openBundlePage(0,{fromScene:true});
        };
        wrap._sceneImageOpen=open;
        wrap.addEventListener('click',open);
        wrap.addEventListener('keydown',(event)=>{
          if(event.key==='Enter' || event.key===' '){ open(event); }
        });
      }

      container.appendChild(wrap);
    }

    _handdrawnSeed(source) {
      let hash=2166136261;
      const value=String(source||'');
      for(let i=0;i<value.length;i++){
        hash^=value.charCodeAt(i);
        hash=Math.imul(hash,16777619);
      }
      return hash>>>0;
    }

    _handdrawnRandom(seed) {
      let state=seed>>>0;
      return ()=>{
        state=(Math.imul(state,1664525)+1013904223)>>>0;
        return state/4294967296;
      };
    }

    _handdrawnPath(width,height,seed,trace=0,shapeLevel=0,frameType='handdrawn-voice') {
      const random=this._handdrawnRandom((seed+Math.imul(trace+1,2654435761))>>>0);
      const inset=5.5+trace*.35;
      const rx=Math.max(8,(width-inset*2)/2);
      const ry=Math.max(8,(height-inset*2)/2);
      const cx=width/2+(random()-.5)*1.8;
      const cy=height/2+(random()-.5)*1.8;
      const count=32;
      const phase=random()*Math.PI*2;
      const points=[];
      for(let i=0;i<count;i++){
        const angle=(Math.PI*2*i/count)-Math.PI/2;
        const ca=Math.cos(angle),sa=Math.sin(angle);
        const n=frameType==='handdrawn-voice'?2.05+Math.max(0,Math.min(1,shapeLevel))*2.35:(['handdrawn-rounded','handdrawn-panel'].includes(frameType)?4.7:8.5);
        const baseX=Math.sign(ca)*Math.pow(Math.abs(ca),2/n)*rx;
        const baseY=Math.sign(sa)*Math.pow(Math.abs(sa),2/n)*ry;
        const harmonic=Math.sin(angle*3+phase)*.010+Math.sin(angle*5-phase*.7)*.006;
        const grain=(random()-.5)*.018;
        const wobble=1+harmonic+grain+(trace-1)*.0025;
        points.push({x:cx+baseX*wobble,y:cy+baseY*wobble});
      }
      let d=`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
      for(let i=0;i<count;i++){
        const p0=points[(i-1+count)%count],p1=points[i],p2=points[(i+1)%count],p3=points[(i+2)%count];
        const c1x=p1.x+(p2.x-p0.x)/6;
        const c1y=p1.y+(p2.y-p0.y)/6;
        const c2x=p2.x-(p3.x-p1.x)/6;
        const c2y=p2.y-(p3.y-p1.y)/6;
        d+=` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
      }
      return `${d} Z`;
    }

    _mountHanddrawnFrame(frame,scene,presentation) {
      const ns='http://www.w3.org/2000/svg';
      const svg=document.createElementNS(ns,'svg');
      svg.classList.add('sp-handdrawn-frame-svg');
      svg.setAttribute('aria-hidden','true');
      svg.setAttribute('preserveAspectRatio','none');
      const defs=document.createElementNS(ns,'defs');
      const filter=document.createElementNS(ns,'filter');
      const filterId=`sp-ink-bleed-${String(scene.id||'scene').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,24)}-${this._handdrawnSeed(scene.text)&65535}`;
      filter.id=filterId;
      filter.setAttribute('x','-5%');filter.setAttribute('y','-5%');filter.setAttribute('width','110%');filter.setAttribute('height','110%');
      const blur=document.createElementNS(ns,'feGaussianBlur');blur.setAttribute('stdDeviation','.72');
      filter.appendChild(blur);defs.appendChild(filter);svg.appendChild(defs);
      const makePath=(className)=>{const path=document.createElementNS(ns,'path');path.classList.add(className);svg.appendChild(path);return path;};
      const fill=makePath('sp-handdrawn-fill');
      const bleed=makePath('sp-handdrawn-bleed');bleed.setAttribute('filter',`url(#${filterId})`);
      const ghost=makePath('sp-handdrawn-ghost');
      const ink=makePath('sp-handdrawn-ink');
      const scuff=makePath('sp-handdrawn-scuff');
      frame.prepend(svg);
      let lastWidth=0,lastHeight=0;
      const draw=()=>{
        if(!frame.isConnected)return;
        const text=frame.querySelector(':scope > .sp-text');
        let fitted=false;
        frame.classList.add('sp-frame-measuring');
        if(text&&frame.dataset.writingMode==='vertical-rl'&&!frame.dataset.inkFitted){
          text.style.maxWidth='none';
          text.style.width='max-content';
          const measureRects=()=>{try{
            const range=document.createRange();
            range.selectNodeContents(text);
            const measured=[...range.getClientRects()].filter(item=>item.width>0&&item.height>0);
            range.detach?.();
            return measured;
          }catch(_){return [];}};
          let rects=measureRects();
          const initialTextRect=text.getBoundingClientRect();
          let inkLeft=rects.length?Math.min(...rects.map(item=>item.left)):initialTextRect.left;
          let inkRight=rects.length?Math.max(...rects.map(item=>item.right)):initialTextRect.right;
          const fittedWidth=Math.ceil(Math.max(text.scrollWidth,inkRight-inkLeft,initialTextRect.width)+2);
          text.style.width=`${fittedWidth}px`;
          rects=measureRects();
          const fittedTextRect=text.getBoundingClientRect();
          inkLeft=rects.length?Math.min(...rects.map(item=>item.left)):fittedTextRect.left;
          inkRight=rects.length?Math.max(...rects.map(item=>item.right)):fittedTextRect.right;
          const inkTop=rects.length?Math.min(...rects.map(item=>item.top)):fittedTextRect.top;
          const inkBottom=rects.length?Math.max(...rects.map(item=>item.bottom)):fittedTextRect.bottom;
          const columns=new Set(rects.map(item=>Math.round(item.left/3)*3)).size||1;
          const charCount=Array.from(String(scene.text||'')).filter(char=>char!=='\n').length;
          const shapeLevel=Math.max(Math.min(1,(columns-1)/3),Math.min(1,Math.max(0,(charCount-18)/58)));
          const mobile=global.innerWidth<=600;
          const padX=(mobile?27:34)+shapeLevel*(mobile?8:12);
          const padY=(mobile?30:38)+shapeLevel*(mobile?13:18);
          const inkWidth=Math.max(1,inkRight-inkLeft),inkHeight=Math.max(1,inkBottom-inkTop);
          text.style.position='absolute';
          text.style.margin='0';
          text.style.height=`${Math.ceil(fittedTextRect.height)}px`;
          text.style.left=`${Math.round(padX-(inkLeft-fittedTextRect.left))}px`;
          text.style.top=`${Math.round(padY-(inkTop-fittedTextRect.top))}px`;
          frame.style.padding='0';
          frame.style.width=`${Math.ceil(inkWidth+padX*2)}px`;
          frame.style.height=`${Math.ceil(inkHeight+padY*2)}px`;
          frame.dataset.shapeLevel=String(shapeLevel);
          frame.dataset.inkFitted='true';
          fitted=true;
        }
        frame.classList.remove('sp-frame-measuring');
        const rect=frame.getBoundingClientRect();
        const width=Math.max(24,Math.round(rect.width*10)/10),height=Math.max(24,Math.round(rect.height*10)/10);
        if(Math.abs(width-lastWidth)<.5&&Math.abs(height-lastHeight)<.5)return;
        lastWidth=width;lastHeight=height;
        svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
        const frameType=frame.dataset.frameType||'handdrawn-voice';
        const seed=this._handdrawnSeed(`${scene.id}|${scene.text}|${Math.round(width)}|${Math.round(height)}|${presentation.text?.writingMode||''}|${frameType}`);
        const shapeLevel=Math.max(0,Math.min(1,Number(frame.dataset.shapeLevel)||0));
        const primary=this._handdrawnPath(width,height,seed,0,shapeLevel,frameType);
        fill.setAttribute('d',primary);ink.setAttribute('d',primary);
        bleed.setAttribute('d',this._handdrawnPath(width,height,seed,1,shapeLevel,frameType));
        ghost.setAttribute('d',this._handdrawnPath(width,height,seed,2,shapeLevel,frameType));
        scuff.setAttribute('d',this._handdrawnPath(width,height,seed,3,shapeLevel,frameType));
        const dashA=26+(seed%17),dashB=3+((seed>>>5)%5),dashC=8+((seed>>>9)%9);
        scuff.setAttribute('stroke-dasharray',`${dashA} ${dashB} ${dashC} ${dashB+2}`);
        scuff.setAttribute('stroke-dashoffset',String(seed%29));
        const article=frame.closest('.sp-scene');
        if(fitted&&article&&!article.classList.contains('entering'))requestAnimationFrame(()=>{
          if(!frame.isConnected||!this.document)return;
          const active=this.document.scenes?.[this.index];
          const display=active?.presentation?.display||'stack';
          const entries=this._visibleScenes(display);
          const byId=new Map([...this.els.scenes.querySelectorAll('.sp-scene')].map(node=>[node.dataset.sceneId,node]));
          const present=entries.map(entry=>({entry,node:byId.get(entry.scene.id)})).filter(item=>item.node);
          const presentNodes=present.map(item=>item.node),presentEntries=present.map(item=>item.entry);
          if(display==='overlay')this._positionOverlayNodes(presentNodes,presentEntries);
          else this._positionSceneNodes(presentNodes,presentEntries,0);
        });
      };
      requestAnimationFrame(draw);
      if(typeof ResizeObserver==='function'){
        const observer=new ResizeObserver(()=>{
          if(!frame.isConnected){observer.disconnect();return;}
          draw();
        });
        observer.observe(frame);
      }
    }


    _renderRichText(node, scene, displayText = null) {
      const source = String(displayText ?? scene?.text ?? '');
      const ranges = Array.isArray(scene?.richText?.ranges) ? scene.richText.ranges : [];
      const tables = Array.isArray(scene?.content) ? scene.content.filter(x => x?.type === 'table') : [];
      if (!ranges.length && !tables.length) { node.textContent = source; return false; }
      node.textContent = '';
      const tableById = new Map(tables.map(t => [String(t.id||''), t]));
      const tableRanges = ranges.filter(r => r?.kind === 'table' && tableById.has(String(r.tableId||'')))
        .map(r => ({...r,start:Math.max(0,Number(r.start)||0),end:Math.min(source.length,Number(r.end)||0)}))
        .sort((a,b)=>a.start-b.start);
      const normal = ranges.filter(r => r?.kind !== 'table').map(r=>({...r,start:Math.max(0,Number(r.start)||0),end:Math.min(source.length,Number(r.end)||0)})).filter(r=>r.end>r.start);
      const appendTextRange=(from,to)=>{
        if(to<=from)return;
        const cuts=new Set([from,to]);
        normal.forEach(r=>{ if(r.end>from&&r.start<to){cuts.add(Math.max(from,r.start));cuts.add(Math.min(to,r.end));} });
        const points=[...cuts].sort((a,b)=>a-b);
        for(let i=0;i<points.length-1;i++){
          const a=points[i],b=points[i+1]; if(b<=a)continue;
          const span=document.createElement('span');
          const active=normal.filter(r=>r.start<=a&&r.end>=b);
          const segmentText=source.slice(a,b);
          // Rich Text Player v0.18: list markers live in canonical Scene text.
          // Never synthesize a bullet from semantic ranges; that can decorate an
          // unrelated repeated word when offsets were re-anchored fuzzily.
          span.textContent=segmentText;
          active.forEach(r=>{
            if(r.kind==='heading'){span.classList.add('sp-rich-heading',`sp-rich-h${Math.max(1,Math.min(6,Number(r.level)||2))}`);}
            if(r.kind==='quote')span.classList.add('sp-rich-quote');
            if(r.kind==='listItem')span.classList.add('sp-rich-list-item');
            if(r.kind==='paragraph')span.classList.add('sp-rich-paragraph');
            if(r.kind==='span'&&r.style?.bold)span.classList.add('sp-rich-bold');
            if(r.kind==='span'&&r.style?.italic)span.classList.add('sp-rich-italic');
            if(r.kind==='span'&&r.style?.color)span.style.color=String(r.style.color);
            if(r.kind==='span'&&r.style?.fontFamily){const richFonts={serif:'var(--sp-font-serif)',sans:'var(--sp-font-sans)',mono:'var(--sp-font-mono)'};span.style.fontFamily=richFonts[String(r.style.fontFamily)]||String(r.style.fontFamily);}
            if(r.kind==='span'&&Number(r.style?.fontScale)>0)span.style.fontSize=`${Number(r.style.fontScale)}em`;
          });
          node.appendChild(span);
        }
      };
      let cursor=0;
      tableRanges.forEach(r=>{
        appendTextRange(cursor,r.start);
        const table=tableById.get(String(r.tableId||''));
        const card=document.createElement('div'); card.className='sp-rich-table-card';
        const wrap=document.createElement('div'); wrap.className='sp-rich-table-scroll';
        wrap.appendChild(this._buildRichTable(table)); card.appendChild(wrap);
        // V25: no fullscreen affordance until the viewer contract is complete.
        // Swallow table taps so they do not accidentally advance the Scene.
        card.addEventListener('click',(e)=>{e.stopPropagation();});
        node.appendChild(card); cursor=Math.max(cursor,r.end);
      });
      appendTextRange(cursor,source.length);
      return true;
    }

    _buildRichTable(table) {
      const el=document.createElement('table'); el.className='sp-rich-table';
      const rows=Array.isArray(table?.rows)?table.rows:[]; const headerRows=Math.max(0,Number(table?.headerRows)||0);
      rows.forEach((row,ri)=>{const tr=document.createElement('tr');(Array.isArray(row)?row:[]).forEach(cell=>{const c=document.createElement(ri<headerRows?'th':'td');c.textContent=String(cell??'');tr.appendChild(c);});el.appendChild(tr);});
      return el;
    }

    _openRichTable(table) {
      const overlay=document.createElement('div'); overlay.className='sp-rich-table-overlay'; overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true');
      const panel=document.createElement('div'); panel.className='sp-rich-table-full';
      const head=document.createElement('div'); head.className='sp-rich-table-full-head';
      const title=document.createElement('strong'); title.textContent='表';
      const close=document.createElement('button'); close.type='button'; close.textContent='×'; close.setAttribute('aria-label','閉じる');
      head.append(title,close); const scroll=document.createElement('div'); scroll.className='sp-rich-table-full-scroll'; scroll.appendChild(this._buildRichTable(table)); panel.append(head,scroll); overlay.appendChild(panel);
      const previousOverflow=document.documentElement.style.overflow;
      const dismiss=()=>{document.removeEventListener('keydown',onKey,true);document.documentElement.style.overflow=previousOverflow;overlay.remove();};
      const onKey=(e)=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dismiss();}};
      close.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();dismiss();});
      overlay.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();if(e.target===overlay)dismiss();});
      panel.addEventListener('click',e=>e.stopPropagation());
      document.addEventListener('keydown',onKey,true);
      document.documentElement.style.overflow='hidden';
      document.body.appendChild(overlay);
      requestAnimationFrame(()=>{try{close.focus({preventScroll:true});}catch(_){close.focus();}});
    }

    _commentReactionValue(presentation) {
      const c=presentation?.webComment||{},r=c.reaction||{};
      if(r.mode==='dynamic')return Math.max(0,Number(r.start)||0);
      if(r.mode==='random')return Math.max(0,Number(r.value ?? c.likes)||0);
      return Math.max(0,Number(c.likes ?? r.value)||0);
    }

    _startCommentReactionCounter(node,presentation) {
      const c=presentation?.webComment||{},r=c.reaction||{};
      if(!node||r.mode!=='dynamic')return;
      const start=Math.max(0,Number(r.start)||0),end=Math.max(0,Number(r.end)||0);
      const delay=Math.max(0,Number(r.delay)||0)*1000,duration=Math.max(.05,Number(r.duration)||3)*1000;
      const curve=r.curve||'burst';
      const begin=()=>{
        const t0=performance.now();
        const tick=now=>{
          let x=Math.min(1,(now-t0)/duration),y=x;
          if(curve==='ease')y=x*x;
          else if(curve==='burst')y=x<.28?.18*(x/.28):.18+.82*(1-Math.pow(1-(x-.28)/.72,3));
          else if(curve==='wave'){
            const smooth=t=>t*t*(3-2*t);
            if(x<.14)y=.04*smooth(x/.14);
            else if(x<.31)y=.04+.22*smooth((x-.14)/.17);
            else if(x<.49)y=.26+.07*smooth((x-.31)/.18);
            else if(x<.68)y=.33+.39*smooth((x-.49)/.19);
            else if(x<.83)y=.72+.05*smooth((x-.68)/.15);
            else y=.77+.23*smooth((x-.83)/.17);
          }else if(curve==='initial'){
            y=1-Math.pow(1-x,4);
          }else if(curve==='fire'){
            if(x<.48)y=.08*(x/.48);
            else y=.08+.92*Math.pow((x-.48)/.52,.34);
          }else if(curve==='steps'){
            const steps=8;y=Math.floor(x*steps)/steps;if(x>=1)y=1;
          }else if(curve==='irregular'){
            const points=[[0,0],[.08,.015],[.17,.02],[.23,.09],[.35,.11],[.43,.27],[.58,.29],[.64,.51],[.77,.55],[.83,.81],[.94,.84],[1,1]];
            for(let i=1;i<points.length;i++){if(x<=points[i][0]){const a=points[i-1],b=points[i],t=(x-a[0])/(b[0]-a[0]);y=a[1]+(b[1]-a[1])*t;break;}}
          }else if(curve==='decay'){
            y=1-Math.pow(1-x,2.35);
          }
          node.textContent=`♡ ${Math.round(start+(end-start)*y)}`;
          if(x<1)requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      if(delay)setTimeout(begin,delay);else begin();
    }


    _attachFlowComments(article,presentation,active=true) {
      const stage=this.els?.stage;
      if(stage)stage.querySelectorAll(':scope > .sp-flow-comments-layer').forEach(node=>node.remove());
      const fc=presentation?.flowComments||{};
      if(!active||!stage||!fc.enabled||!Array.isArray(fc.comments)||!fc.comments.length)return;
      const layer=document.createElement('div');
      layer.className='sp-flow-comments-layer';
      // Mount directly on the Player stage. A fixed child inside a Scene can be
      // trapped by transformed/clipped Scene ancestors and disappear entirely.
      Object.assign(layer.style,{position:'absolute',inset:'0',overflow:'hidden',pointerEvents:'none',zIndex:'214'});
      const density=String(fc.density||'normal');
      const laneCount=density==='danmaku'?12:density==='many'?10:density==='few'?7:9;
      const laneReady=new Array(laneCount).fill(0);
      const comments=fc.comments.map((raw,i)=>({raw,i})).sort((a,b)=>{
        const ar=a.raw?.role==='manual'?0:1,br=b.raw?.role==='manual'?0:1;
        return ar-br||(Number(a.raw?.delay)||0)-(Number(b.raw?.delay)||0)||a.i-b.i;
      });
      comments.forEach(({raw,i})=>{
        const text=String(raw?.text||'').trim();if(!text)return;
        const manual=raw?.role==='manual';
        const el=document.createElement('span');el.className='sp-flow-comment';el.textContent=text;
        const requested=Math.max(0,(Number(raw.delay)||0)*1000);
        let lane;
        if(manual){
          // Important comments reserve the earliest free lane so extras cannot bury them.
          lane=laneReady.indexOf(Math.min(...laneReady));
        }else if(Number.isFinite(Number(raw.lane))){
          lane=Math.abs(Math.floor(Number(raw.lane)))%laneCount;
        }else{
          lane=laneReady.indexOf(Math.min(...laneReady));
        }
        const startAt=Math.max(requested,laneReady[lane]);
        const top=3+(lane*(92/Math.max(1,laneCount-1)));
        const size=Math.max(14,Math.min(34,Number(raw.size)||20));
        // Existing v0.1 values were 7-14s; clamp them so old Scenes also feel like flowing comments.
        const hinted=Number(raw.speed);
        const natural=2.8+Math.min(2.0,text.length*.055);
        const baseDuration=Number.isFinite(hinted)?hinted:natural;
        const durationSec=Math.max(1.9,Math.min(4.1,baseDuration*.70));
        // Reserve a lane only until the previous comment has moved far enough left, not until it exits.
        const spacing=Math.max(520,Math.min(1450,700+text.length*22));
        laneReady[lane]=startAt+spacing;
        Object.assign(el.style,{position:'absolute',left:'100%',top:`${top}%`,whiteSpace:'nowrap',fontSize:`${size}px`,fontWeight:'700',lineHeight:'1.15',color:String(raw.color||'#FFFFFF'),textShadow:'0 2px 4px rgba(0,0,0,.98),0 0 7px rgba(0,0,0,.9),0 0 14px rgba(0,0,0,.62)',willChange:'transform',opacity:'0'});
        layer.appendChild(el);
        const start=()=>{if(!el.isConnected)return;el.style.opacity='1';const distance=(layer.clientWidth||window.innerWidth||800)+(el.offsetWidth||200)+64;const anim=el.animate([{transform:'translateX(0)'},{transform:`translateX(-${distance}px)`}],{duration:durationSec*1000,easing:'linear',fill:'forwards'});anim.onfinish=()=>{el.style.opacity='0';};};
        setTimeout(start,startAt);
      });
      stage.appendChild(layer);
    }

    _logTimeText(scene, presentation = scene?.presentation || {}) {
      const lt=presentation.logTime||{};
      let mode=String(lt.mode||'');
      if(!mode && presentation.view==='web-board' && presentation.webBoard?.date)mode='work';
      if(mode==='none'||!mode)return '';
      if(mode==='work')return String(lt.workTime||presentation.webBoard?.date||'');
      if(mode==='edit')return String(lt.editedAt||'');
      if(mode==='reader'){
        const d=new Date(),z=n=>String(n).padStart(2,'0'),wd=['日','月','火','水','木','金','土'][d.getDay()];
        return `${d.getFullYear()}/${z(d.getMonth()+1)}/${z(d.getDate())}(${wd}) ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
      }
      if(mode==='relative')return String(lt.relativeText||'1時間前');
      return '';
    }


    _chatReadKey(scene) {
      if(!scene || typeof scene!=='object')return '';
      const explicit=String(scene.id||'').trim();
      if(explicit)return `id:${explicit}`;
      let key=this.chatReadSceneKeys.get(scene);
      if(!key){key=`anon:${++this.chatReadSceneKeySeq}`;this.chatReadSceneKeys.set(scene,key);}
      return key;
    }


    _messageStateKey(scene) { return `message:${this._chatReadKey(scene)}`; }

    _messageStateInfo(scene, presentation = scene?.presentation || {}) {
      const raw=presentation.messageState||{};
      const mode=String(raw.mode||'normal');
      const delay=Math.max(0,Math.min(300,Number(raw.delay||0)));
      return {mode:mode==='deleted'?'deleted':'normal',delay};
    }

    _messageStateDeleted(scene, presentation = scene?.presentation || {}) {
      const info=this._messageStateInfo(scene,presentation);
      if(info.mode!=='deleted')return false;
      if(info.delay<=0)return true;
      const started=this.messageStateStartedAt.get(this._messageStateKey(scene));
      return Number.isFinite(started)&&(Date.now()-started)>=info.delay*1000;
    }

    _scheduleMessageState(scene,presentation = scene?.presentation || {}) {
      const info=this._messageStateInfo(scene,presentation);
      if(info.mode!=='deleted'||info.delay<=0)return;
      const key=this._messageStateKey(scene);
      if(!this.messageStateStartedAt.has(key))this.messageStateStartedAt.set(key,Date.now());
      const remain=Math.max(0,info.delay*1000-(Date.now()-this.messageStateStartedAt.get(key)));
      const apply=()=>{
        this.host.querySelectorAll(`[data-message-state-key="${key}"]`).forEach(n=>{
          n.classList.add('is-message-deleted');
          const text=n.querySelector('.sp-message-state-text');if(text)text.hidden=false;
          if(n.classList.contains('sp-chat-row')){
            n.querySelectorAll('.sp-chat-message-visual').forEach(el=>{el.hidden=true;el.style.setProperty('display','none','important');});
          }else{
            const original=n.querySelector('.sp-message-original');if(original)original.hidden=true;
          }
        });
        if(this.historyOpen)this._renderHistory();
      };
      if(remain<=0){setTimeout(apply,0);return;}
      if(this.messageStateTimers.has(key))return;
      this.messageStateTimers.set(key,setTimeout(()=>{this.messageStateTimers.delete(key);apply();},remain));
    }

    _chatReadMode(scene, presentation = scene?.presentation || {}) {
      if(this._messageStateInfo(scene,presentation).mode==='deleted')return 'none';
      const chat=presentation.chat||{};
      const mode=String(chat.readMode||'').trim();
      if(['none','individual','auto','manual'].includes(mode))return mode;
      return chat.readStatus==='read'?'individual':'none';
    }

    _chatReadGroupInfo(scene, presentation = scene?.presentation || {}) {
      const mode=this._chatReadMode(scene,presentation);
      const scenes=Array.isArray(this.document?.scenes)?this.document.scenes:[];
      const index=scenes.indexOf(scene);
      if(mode==='none'||index<0)return {mode,key:'',members:[],end:scene};
      if(mode==='individual')return {mode,key:`individual:${this._chatReadKey(scene)}`,members:[scene],end:scene};
      if(mode==='manual'){
        const gid=String(presentation.chat?.readGroupId||'').trim();
        if(!gid)return {mode:'individual',key:`individual:${this._chatReadKey(scene)}`,members:[scene],end:scene};
        const members=scenes.filter(sc=>{const pr=sc?.presentation||{};return pr.view==='chat'&&pr.text?.align==='right'&&this._chatReadMode(sc,pr)==='manual'&&String(pr.chat?.readGroupId||'').trim()===gid;});
        return {mode,key:`manual:${gid}`,members,end:members[members.length-1]||scene};
      }
      // auto: contiguous sender-side messages using auto mode are one timing group.
      let a=index,b=index;
      while(a>0){const sc=scenes[a-1],pr=sc?.presentation||{};if(!(pr.view==='chat'&&pr.text?.align==='right'&&this._chatReadMode(sc,pr)==='auto'))break;a--;}
      while(b+1<scenes.length){const sc=scenes[b+1],pr=sc?.presentation||{};if(!(pr.view==='chat'&&pr.text?.align==='right'&&this._chatReadMode(sc,pr)==='auto'))break;b++;}
      const members=scenes.slice(a,b+1);
      return {mode,key:`auto:${a}:${b}`,members,end:scenes[b]||scene};
    }

    _chatReadGroupEnd(scene, presentation = scene?.presentation || {}) {
      const g=this._chatReadGroupInfo(scene,presentation);return !!g.key&&g.end===scene;
    }

    _chatReadDelayMs(scene, presentation = scene?.presentation || {}) {
      const mode=this._chatReadMode(scene,presentation);if(mode==='none')return 0;
      const g=this._chatReadGroupInfo(scene,presentation), endp=g.end?.presentation||presentation;
      return Math.max(0,Math.min(300000,Number(endp.chat?.readDelay||0)*1000));
    }

    _chatReadVisible(scene, presentation = scene?.presentation || {}) {
      const g=this._chatReadGroupInfo(scene,presentation);if(!g.key)return false;
      const delay=this._chatReadDelayMs(scene,presentation);if(delay<=0)return this.chatReadStartedAt.has(g.key);
      const started=this.chatReadStartedAt.get(g.key);return Number.isFinite(started)&&(Date.now()-started)>=delay;
    }

    _scheduleChatRead(scene, presentation = scene?.presentation || {}) {
      const g=this._chatReadGroupInfo(scene,presentation);if(!g.key||g.end!==scene)return;
      const delay=this._chatReadDelayMs(scene,presentation);
      if(!this.chatReadStartedAt.has(g.key))this.chatReadStartedAt.set(g.key,Date.now());
      const remain=Math.max(0,delay-(Date.now()-this.chatReadStartedAt.get(g.key)));
      const reveal=()=>{
        const key=g.key;
        this.host.querySelectorAll('.sp-chat-read[data-chat-read-group]').forEach(n=>{if(n.dataset.chatReadGroup===key)n.classList.remove('is-pending');});
        if(this.historyOpen)this._renderHistory();
      };
      // The scene article is still detached while _renderScene() is building it.
      // In particular, an individual receipt with 0s (or a Studio re-render that
      // has already consumed its delay) used to call reveal() before the new
      // .sp-chat-read node was mounted.  The receipt then appeared only after a
      // later Scene/render, which made Individual mode look inconsistent.
      // Always reveal on/after the next paint once the node can exist in host.
      const revealMounted=()=>{
        if(typeof requestAnimationFrame==='function')requestAnimationFrame(reveal);
        else setTimeout(reveal,0);
      };
      if(remain<=0){revealMounted();return;}
      if(this.chatReadTimers.has(g.key))return;
      const timer=setTimeout(()=>{this.chatReadTimers.delete(g.key);revealMounted();},remain);
      this.chatReadTimers.set(g.key,timer);
    }

    _chatTimeParts(scene, presentation = scene?.presentation || {}) {
      const raw=this._logTimeText(scene,presentation);
      if(!raw)return {raw:'',time:'',dateKey:'',dateLabel:''};
      const m=String(raw).match(/(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})(?:\([^)]*\))?\s+(\d{1,2}):(\d{2})(?::\d{2})?/);
      if(!m)return {raw:String(raw),time:String(raw),dateKey:'',dateLabel:''};
      const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]),hh=String(m[4]).padStart(2,'0'),mm=m[5];
      const dt=new Date(y,mo-1,d);
      const z=n=>String(n).padStart(2,'0');
      const key=`${y}-${z(mo)}-${z(d)}`;
      const today=new Date();today.setHours(0,0,0,0);
      const yesterday=new Date(today);yesterday.setDate(today.getDate()-1);
      const same=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
      const wd=['日','月','火','水','木','金','土'][dt.getDay()];
      return {raw:String(raw),time:`${hh}:${mm}`,dateKey:key,dateLabel:same(dt,yesterday)?'昨日':`${mo}/${d}(${wd})`};
    }

    _chatContinues(previous, scene) {
      const a=previous?.presentation||{}, b=scene?.presentation||{};
      if(a.view!=='chat'||b.view!=='chat'||!previous?.text||!scene?.text)return false;
      if((a.text?.align==='right')!==(b.text?.align==='right'))return false;
      if(this._messageStateInfo(previous,a).mode==='deleted'||this._messageStateInfo(scene,b).mode==='deleted')return false;
      if(this._chatDateSeparator(scene,b))return false;
      const ac=a.chat||{},bc=b.chat||{};
      if(ac.speakerId&&bc.speakerId)return ac.speakerId===bc.speakerId;
      const an=String(previous.subText||'').trim(),bn=String(scene.subText||'').trim();
      if(an&&bn)return an===bn;
      const ai=ac.icon||ac.iconPreset,bi=bc.icon||bc.iconPreset;
      return !!ai&&ai===bi;
    }

    _chatDateSeparator(scene, presentation = scene?.presentation || {}) {
      const cur=this._chatTimeParts(scene,presentation);
      if(!cur.dateKey)return '';
      const scenes=Array.isArray(this.document?.scenes)?this.document.scenes:[];
      const index=scenes.indexOf(scene);
      if(index<=0)return '';
      for(let i=index-1;i>=0;i--){
        const prev=scenes[i],pp=prev?.presentation||{};
        if(pp.view!=='chat')break;
        const old=this._chatTimeParts(prev,pp);
        if(!old.dateKey)continue;
        return old.dateKey!==cur.dateKey?cur.dateLabel:'';
      }
      return '';
    }

    _sceneNode(scene, active, age) {
      const article = document.createElement('article');
      article.className = `sp-scene sp-type-${scene.type}`;
      article.dataset.sceneId = scene.id;
      article.dataset.age = String(age);
      const sceneLanguage = scene.language || (this.document?.language && this.document.language !== 'mul' ? this.document.language : '');
      if (sceneLanguage) { article.lang = sceneLanguage; article.dataset.language = sceneLanguage; }
      article.dir = scene.direction || this.document?.direction || 'auto';
      article.classList.toggle('is-active', active);
      if (!active) article.classList.add('is-visible');

      const presentation = scene.presentation || {};
      this._attachFlowComments(article,presentation,active);
      article.dataset.sceneFlow=presentation.flow==='horizontal'?'horizontal':'vertical';
      article.dataset.writingMode=presentation.text?.writingMode==='vertical-rl'?'vertical-rl':'horizontal-tb';
      const requestedEffect = presentation.effect || 'auto';
      const effect = this._resolveSceneEffect(scene, requestedEffect);
      if (effect && /^[a-zA-Z0-9_-]+$/.test(effect)) article.dataset.effect = effect;
      const fxTiming = presentation.effectTiming || {};
      const fxDuration = Math.max(.08, Math.min(6, asNumber(fxTiming.duration, 0)));
      const fxDelay = Math.max(0, Math.min(6, asNumber(fxTiming.delay, 0)));
      if (fxDuration > 0) article.style.setProperty('--sp-effect-duration', `${fxDuration}s`);
      if (fxDelay > 0) article.style.setProperty('--sp-effect-delay', `${fxDelay}s`);
      if (requestedEffect === 'auto') article.dataset.autoTransition = 'true';
      if (presentation.view && /^[a-zA-Z0-9_-]+$/.test(presentation.view)) article.dataset.view = presentation.view;
      const entryMotion = presentation.entryMotion === 'still' ? 'still' : 'flow';
      article.dataset.entryMotion = entryMotion;
      article.dataset.fit = this._resolveAutoFit(scene, presentation.text || {});

      if (presentation.view === 'web-qa') {
        article.classList.add('sp-web-qa-scene');const q=presentation.webQA||{},a=q.answer||{},qaIndex=(this.document?.scenes||[]).indexOf(scene);let kind=q.kind||'legacy-answer';
        let qScene=scene,qPresentation=presentation,qData=q;
        if(kind==='answer'&&q.qaId){for(let j=qaIndex-1;j>=0;j--){const cand=this.document?.scenes?.[j],cp=cand?.presentation||{},cq=cp.webQA||{};if(cp.view!=='web-qa')break;if(cq.qaId===q.qaId&&cq.kind==='question'){qScene=cand;qPresentation=cp;qData=cq;break;}}}
        const qu=qData.question||{},wrap=document.createElement('div');wrap.className='sp-web-qa-wrap';
        const makeQuestion=()=>{const qbox=document.createElement('section');qbox.className='sp-web-qa-question';const status=document.createElement('span');status.className='sp-web-qa-status';status.textContent=qu.status==='resolved'?'解決済み':'受付中';const qt=document.createElement('div');qt.className='sp-web-qa-title';qt.textContent=qu.title||'質問';const qb=document.createElement('div');qb.className='sp-web-qa-question-body';if(kind==='question'&&qScene===scene)qb.classList.add('is-question-scene-text');qb.textContent=qData.kind==='question'?String(qScene.text||''):String(qu.body||'');const qm=document.createElement('div');qm.className='sp-web-qa-question-meta';const qav=document.createElement('span');qav.className='sp-web-qa-icon sp-web-qa-question-icon';const qsrc=ahakoAvatarSrc(qu.iconPreset);if(qsrc){const qi=document.createElement('img');qi.src=qsrc;qi.alt='';qav.appendChild(qi);}else qav.textContent=String(qu.name||'質').trim().slice(0,1)||'質';const qname=document.createElement('span');qname.textContent=qu.name||'質問者';qm.append(qav,qname);qbox.append(status,qt,qb,qm);return qbox;};
        const makeAnswer=()=>{const ans=document.createElement('section');ans.className='sp-web-qa-answer';if(a.best)ans.classList.add('is-best');const head=document.createElement('div');head.className='sp-web-qa-answer-head';const av=document.createElement('div');av.className='sp-web-qa-icon';const src=ahakoAvatarSrc(a.iconPreset);if(src){const img=document.createElement('img');img.src=src;img.alt='';av.appendChild(img);}else av.textContent=String(a.name||'回').trim().slice(0,1)||'回';const who=document.createElement('strong');who.textContent=a.name||'回答者';const badge=document.createElement('span');badge.className='sp-web-qa-answer-label';badge.textContent=a.best?'🏆 ベストアンサー':'回答';head.append(av,who,badge);const tx=document.createElement('div');tx.className='sp-web-qa-answer-text';tx.textContent=a.deleted?'この回答は削除されました':String(scene.text||'');const meta=document.createElement('div');meta.className='sp-web-qa-meta';const tm=this._logTimeText(scene,presentation);meta.textContent=[Number(a.good)>0?'GOOD '+Number(a.good):'',tm].filter(Boolean).join(' · ');ans.append(head,tx,meta);return ans;};
        if(kind==='question'){wrap.appendChild(makeQuestion());}
        else if(kind==='answer'){if(a.best)wrap.appendChild(makeQuestion());wrap.appendChild(makeAnswer());}
        else{const qaPrev=qaIndex>0?this.document.scenes[qaIndex-1]:null,qaFirst=!qaPrev||qaPrev?.presentation?.view!=='web-qa';if(qaFirst)wrap.appendChild(makeQuestion());wrap.appendChild(makeAnswer());}
        article.appendChild(wrap);article.dataset.view='web-qa';return article;
      }

      if (presentation.view === 'web-sns') {
        article.classList.add('sp-web-sns-scene');const m=presentation.webSNS||{},row=document.createElement('div');row.className='sp-web-sns-row';
        const profileUrl=(()=>{try{const u=new URL(String(m.profileUrl||''),location.href);return /^https?:$/.test(u.protocol)?u.href:'';}catch(_){return '';}})();
        const avatar=document.createElement(profileUrl?'a':'div');avatar.className='sp-web-sns-avatar';if(profileUrl){avatar.href=profileUrl;avatar.target='_blank';avatar.rel='noopener noreferrer';avatar.title='外部プロフィールを開く';avatar.addEventListener('click',e=>{e.stopPropagation();if(!window.confirm('外部プロフィールを開きます。'))e.preventDefault();});}
        const src=m.icon||ahakoAvatarSrc(m.iconPreset);if(src){const img=document.createElement('img');img.src=src;img.alt='';avatar.appendChild(img);}else avatar.textContent=String(m.name||'ユ').trim().slice(0,1)||'ユ';
        const content=document.createElement('div');content.className='sp-web-sns-content';const head=document.createElement('div');head.className='sp-web-sns-head';
        const identity=document.createElement(profileUrl?'a':'span');identity.className='sp-web-sns-identity';if(profileUrl){identity.href=profileUrl;identity.target='_blank';identity.rel='noopener noreferrer';identity.title='外部プロフィールを開く';identity.addEventListener('click',e=>{e.stopPropagation();if(!window.confirm('外部プロフィールを開きます。'))e.preventDefault();});}
        const nm=document.createElement('strong');nm.textContent=m.name||'ユーザー';const hd=document.createElement('span');hd.className='sp-web-sns-handle';hd.textContent=m.handle||'@user';identity.append(nm,hd);head.appendChild(identity);
        const tm=this._logTimeText(scene,presentation);if(tm){const time=document.createElement('span');time.className='sp-web-sns-time';time.textContent=tm;head.appendChild(time);}
        const tx=document.createElement('div');tx.className='sp-web-sns-text sp-message-original';tx.textContent=m.deleted?'この投稿は削除されました':String(scene.text||'');
        const metrics=document.createElement('div');metrics.className='sp-web-sns-metrics';const likes=Math.max(0,Number(m.likes)||0),reposts=Math.max(0,Number(m.reposts)||0),replies=Math.max(0,Number(m.replies)||0);metrics.innerHTML=`<span>♡ ${likes}</span><span>↻ ${reposts}</span><span>💬 ${replies}</span>`;
        content.append(head,tx,metrics);row.append(avatar,content);article.appendChild(row);article.dataset.view='web-sns';return article;
      }

      if (presentation.view === 'web-notification') {
        article.classList.add('sp-web-notification-scene');const m=presentation.webNotification||{},card=document.createElement('div');card.className='sp-web-notification-card';
        const icon=document.createElement('div');icon.className='sp-web-notification-icon';const iconSrc=m.icon||ahakoAvatarSrc(m.iconPreset);if(iconSrc){const img=document.createElement('img');img.src=iconSrc;img.alt='';icon.appendChild(img);}else icon.textContent=({social:'💬',mail:'✉',system:'⚙',message:'●',other:'🔔'})[m.kind]||'🔔';
        const content=document.createElement('div');content.className='sp-web-notification-content';
        const head=document.createElement('div');head.className='sp-web-notification-head';const source=document.createElement('strong');source.textContent=m.source||'通知';head.appendChild(source);const tm=this._logTimeText(scene,presentation);if(tm){const time=document.createElement('span');time.className='sp-web-notification-time';time.textContent=tm;head.appendChild(time);}
        const title=document.createElement('div');title.className='sp-web-notification-title';title.textContent=m.title||'お知らせ';
        const tx=document.createElement('div');tx.className='sp-web-notification-text sp-message-original';tx.textContent=String(scene.text||'');
        content.append(head,title,tx);card.append(icon,content);article.appendChild(card);article.dataset.view='web-notification';return article;
      }

      if (presentation.view === 'web-mail') {
        article.classList.add('sp-web-mail-scene');const m=presentation.webMail||{},wrap=document.createElement('div');
        wrap.className='sp-web-mail-card'+(m.folder==='draft'?' is-open':'');
        const summary=document.createElement('button');summary.type='button';summary.className='sp-web-mail-summary';
        const sav=document.createElement('span');sav.className='sp-web-mail-summary-avatar';const src=m.icon||ahakoAvatarSrc(m.iconPreset);if(src){const img=document.createElement('img');img.src=src;img.alt='';sav.appendChild(img);}else sav.textContent=String(m.senderName||'差').trim().slice(0,1)||'差';
        const smain=document.createElement('span');smain.className='sp-web-mail-summary-main';const swho=document.createElement('strong');swho.textContent=(m.folder==='sent'||m.folder==='draft')?(`To: ${String(m.to||'宛先未設定')}`):(m.senderName||'差出人');const ssub=document.createElement('span');ssub.textContent=m.subject||'件名なし';smain.append(swho,ssub);
        const smeta=document.createElement('span');smeta.className='sp-web-mail-summary-meta';const tm=this._logTimeText(scene,presentation);if(m.attachmentName){const clip=document.createElement('span');clip.textContent='📎';smeta.appendChild(clip);}const sstar=document.createElement('span');sstar.className='sp-web-mail-star';sstar.textContent=m.starred?'★':'☆';if(m.starred)sstar.style.color='#e5b20a';smeta.appendChild(sstar);if(tm){const stime=document.createElement('span');stime.textContent=tm;smeta.appendChild(stime);}summary.append(sav,smain,smeta);
        const detail=document.createElement('div');detail.className='sp-web-mail-detail';
        const top=document.createElement('div');top.className='sp-web-mail-top';const folder=document.createElement('span');folder.className='sp-web-mail-folder';folder.textContent=({inbox:'受信',sent:'送信済み',draft:'下書き',spam:'迷惑メール'})[m.folder]||'受信';const star=document.createElement('span');star.className='sp-web-mail-star';star.textContent=m.starred?'★':'☆';if(m.starred)star.style.color='#e5b20a';const time=document.createElement('span');time.className='sp-web-mail-time';time.textContent=tm||'';top.append(folder,star,time);
        const subject=document.createElement('div');subject.className='sp-web-mail-subject';subject.textContent=m.subject||'件名なし';
        const identity=document.createElement('div');identity.className='sp-web-mail-identity';const av=document.createElement('span');av.className='sp-web-mail-avatar';if(src){const img=document.createElement('img');img.src=src;img.alt='';av.appendChild(img);}else av.textContent=String(m.senderName||'差').trim().slice(0,1)||'差';const who=document.createElement('div');who.className='sp-web-mail-who';const name=document.createElement('strong');name.textContent=m.senderName||'差出人';const addr=document.createElement('span');addr.textContent=m.senderAddress||'';who.append(name,addr);identity.append(av,who);
        const routes=document.createElement('div');routes.className='sp-web-mail-routes';const to=String(m.to||'').trim(),cc=String(m.cc||'').trim();if(to){const x=document.createElement('div');x.textContent='To: '+to;routes.appendChild(x);}if(cc){const x=document.createElement('div');x.textContent='CC: '+cc;routes.appendChild(x);}
        const tx=document.createElement('div');tx.className='sp-web-mail-text sp-message-original';tx.textContent=String(scene.text||'');
        detail.append(top,subject,identity,routes,tx);if(m.attachmentName){const att=document.createElement('div');att.className='sp-web-mail-attachment';att.textContent='📎 '+String(m.attachmentName);detail.appendChild(att);}wrap.append(summary,detail);article.appendChild(wrap);article.dataset.view='web-mail';
        const toggle=e=>{e.preventDefault();e.stopPropagation();wrap.classList.toggle('is-open');};summary.addEventListener('pointerdown',e=>e.stopPropagation());summary.addEventListener('click',toggle);return article;
      }

      if (presentation.view === 'web-review' && (scene.text || scene.subText)) {
        article.classList.add('sp-web-review-scene');const r=presentation.webReview||{};const row=document.createElement('div');row.className='sp-web-review-row';
        const icon=document.createElement('div');icon.className='sp-web-review-icon';if(r.icon||ahakoAvatarSrc(r.iconPreset)){const img=document.createElement('img');img.src=ahakoAvatarSrc(r.iconPreset)||r.icon;img.alt='';icon.appendChild(img);}else icon.textContent=String(r.name||'ゲ').trim().slice(0,1)||'ゲ';
        const body=document.createElement('div');body.className='sp-web-review-body';const head=document.createElement('div');head.className='sp-web-review-head';const name=document.createElement('span');name.className='sp-web-review-name';name.textContent=r.name||scene.subText||'ゲスト';head.appendChild(name);
        if(r.verified){const v=document.createElement('span');v.className='sp-web-review-verified';v.textContent='確認済み';head.appendChild(v);}const stars=document.createElement('div');stars.className='sp-web-review-stars';const rating=Math.max(1,Math.min(5,Number(r.rating)||5));stars.textContent='★'.repeat(rating)+'☆'.repeat(5-rating);
        const tx=document.createElement('div');tx.className='sp-web-review-text';tx.textContent=String(scene.text||'');const meta=document.createElement('div');meta.className='sp-web-review-meta';const tm=this._logTimeText(scene,presentation);if(tm)meta.textContent=tm;body.append(head,stars,tx,meta);row.append(icon,body);article.appendChild(row);article.dataset.view='web-review';return article;
      }

      if (presentation.view === 'web-comment' && (scene.text || scene.subText)) {
        article.classList.add('sp-web-comment-scene');
        const c=presentation.webComment||{};
        const row=document.createElement('div');row.className='sp-web-comment-row'+(c.replyTo?' is-reply':'');
        const icon=document.createElement('div');icon.className='sp-web-comment-icon';
        if(c.icon||ahakoAvatarSrc(c.iconPreset)){const img=document.createElement('img');img.src=c.icon||ahakoAvatarSrc(c.iconPreset);img.alt='';icon.appendChild(img);}else if(c.iconPreset){icon.classList.add('sp-comment-preset','is-'+String(c.iconPreset).replace(/[^a-z0-9_-]/gi,''));icon.textContent={moon:'☾',star:'✦',coffee:'●',cat:'⌁',book:'▤',leaf:'◆',night:'●',plain:'●'}[c.iconPreset]||'●';}else icon.textContent=c.iconText||'●';
        const body=document.createElement('div');body.className='sp-web-comment-body';
        const name=document.createElement('div');name.className='sp-web-comment-name';name.textContent=c.name||scene.subText||'名無しさん';body.appendChild(name);
        const text=document.createElement('div');text.className='sp-web-comment-text sp-message-original';text.textContent=String(scene.text||'');body.appendChild(text);
        const state=this._messageStateInfo(scene,presentation);
        if(state.mode==='deleted'){const deleted=document.createElement('div');deleted.className='sp-web-comment-text sp-message-state-text';deleted.textContent='このコメントは削除されました';const isDeleted=this._messageStateDeleted(scene,presentation);deleted.hidden=!isDeleted;text.hidden=isDeleted;row.dataset.messageStateKey=this._messageStateKey(scene);body.appendChild(deleted);this._scheduleMessageState(scene,presentation);}
        const meta=document.createElement('div');meta.className='sp-web-comment-meta';
        const tm=this._logTimeText(scene,presentation);if(tm){const t=document.createElement('span');t.textContent=tm;meta.appendChild(t);}
        const likes=document.createElement('span');likes.textContent=`♡ ${this._commentReactionValue(presentation)}`;meta.appendChild(likes);this._startCommentReactionCounter(likes,presentation);
        if(c.replyTo){const rep=document.createElement('span');rep.className='sp-web-comment-reply-label';rep.textContent='返信';meta.appendChild(rep);}
        body.appendChild(meta);row.append(icon,body);article.appendChild(row);
        article.dataset.view='web-comment';
        return article;
      }

      if (presentation.view === 'web-board' && (scene.text || scene.subText)) {
        article.classList.add('sp-web-board-scene');
        const meta = presentation.webBoard || {};
        const post = document.createElement('div'); post.className = 'sp-web-board-post';
        const head = document.createElement('div'); head.className = 'sp-web-board-head';
        const no = meta.number !== undefined && meta.number !== '' ? String(meta.number) : '';
        const name = String(meta.name || scene.subText || '名無しさん');
        const date = this._logTimeText(scene,presentation);
        const uid = String(meta.userId || '');
        const email = String(meta.email || '');
        if(no){ const el=document.createElement('span');el.className='sp-web-board-no';el.textContent=no;head.appendChild(el); }
        const nm=document.createElement('span');nm.className='sp-web-board-name';nm.textContent='名前：'+name;head.appendChild(nm);
        if(email){const el=document.createElement('span');el.className='sp-web-board-email';el.textContent='['+email+']';head.appendChild(el);}
        if(date){const el=document.createElement('span');el.className='sp-web-board-date';el.textContent=date;head.appendChild(el);}
        if(uid){const el=document.createElement('span');el.className='sp-web-board-id';el.textContent='ID:'+uid;head.appendChild(el);}
        post.appendChild(head);
        if(meta.replyTo){const reply=document.createElement('div');reply.className='sp-web-board-reply';reply.textContent=this._boardReplyLabel(meta);reply.tabIndex=0;reply.setAttribute('role','button');this._bindBoardAnchor(reply,scene,meta);post.appendChild(reply);}
        if(typeof scene.text==='string' && scene.text.length){const text=document.createElement('div');text.className='sp-text sp-web-board-text sp-message-original';this._renderRichText(text,scene);this._applyTextStyle(text,presentation.text||{},false);post.appendChild(text);}
        const boardState=this._messageStateInfo(scene,presentation);
        if(boardState.mode==='deleted'){const deleted=document.createElement('div');deleted.className='sp-web-board-text sp-message-state-text';deleted.textContent='この書き込みは削除されました';const isDeleted=this._messageStateDeleted(scene,presentation);deleted.hidden=!isDeleted;const original=post.querySelector('.sp-message-original');if(original)original.hidden=isDeleted;post.dataset.messageStateKey=this._messageStateKey(scene);post.appendChild(deleted);this._scheduleMessageState(scene,presentation);}
        article.appendChild(post);
      } else if (presentation.view === 'chat' && (scene.text || scene.subText)) {
        article.classList.add('sp-chat-scene');
        const align = presentation.text?.align === 'right' ? 'right' : 'left';
        article.dataset.chatSide = align;
        const row = document.createElement('div');
        row.className = 'sp-chat-row';

        const icon = document.createElement('div');
        icon.className = 'sp-chat-icon';
        const iconSrc = this._chatIconSource(presentation);
        if (iconSrc) {
          const img = this._chatIconImage(iconSrc);
          icon.appendChild(img);
        } else {
          icon.textContent = presentation.chat?.iconText || '●';
        }

        const body = document.createElement('div');
        body.className = 'sp-chat-body';
        if (typeof scene.subText === 'string' && scene.subText.length) {
          const speaker = document.createElement('div');
          speaker.className = 'sp-chat-speaker sp-subtext';
          speaker.textContent = scene.subText;
          this._applyTextStyle(speaker, presentation.subText || {}, true);
          body.appendChild(speaker);
        }
        let bubbleLine=null;
        if (typeof scene.text === 'string' && scene.text.length) {
          bubbleLine=document.createElement('div');bubbleLine.className='sp-chat-bubble-line';
          const bubble = document.createElement('div');
          bubble.className = 'sp-chat-bubble';
          if (presentation.chat?.bubbleColor) bubble.style.background = presentation.chat.bubbleColor;
          const text = document.createElement('div');
          text.className = 'sp-text sp-message-original';
          this._renderRichText(text, scene, chatDisplayText(scene.text));
          this._applyTextStyle(text, presentation.text || {}, false);
          if (presentation.chat?.bubbleTextColor) text.style.setProperty('color', String(presentation.chat.bubbleTextColor), 'important');
          bubble.appendChild(text);
          bubbleLine.appendChild(bubble);
        }
        const chatState=this._messageStateInfo(scene,presentation);
        const chatIsDeleted=chatState.mode==='deleted'&&this._messageStateDeleted(scene,presentation);
        icon.classList.add('sp-chat-message-visual');
        if(bubbleLine)bubbleLine.classList.add('sp-chat-message-visual');
        const speakerNode=body.querySelector('.sp-chat-speaker');
        if(speakerNode)speakerNode.classList.add('sp-chat-message-visual');
        const chatTime=this._chatTimeParts(scene,presentation);
        if(chatTime.time){
          const meta=document.createElement('div');meta.className='sp-chat-meta';
          if(align==='right' && this._chatReadMode(scene,presentation)!=='none'){const group=this._chatReadGroupInfo(scene,presentation);const read=document.createElement('span');read.className='sp-chat-read';read.dataset.chatReadGroup=group.key;if(!this._chatReadVisible(scene,presentation))read.classList.add('is-pending');read.textContent='既読';meta.appendChild(read);if(group.end===scene)this._scheduleChatRead(scene,presentation);}
          const time=document.createElement('span');time.className='sp-chat-time';time.textContent=chatTime.time;meta.appendChild(time);
          if(bubbleLine)bubbleLine.appendChild(meta);else{meta.classList.add('sp-chat-message-visual');body.appendChild(meta);}
        }
        if(bubbleLine)body.appendChild(bubbleLine);
        if(chatState.mode==='deleted'){
          const deleted=document.createElement('div');
          deleted.className='sp-message-state-text sp-chat-cancelled-message';
          deleted.textContent='メッセージの送信を取り消しました';
          deleted.hidden=!chatIsDeleted;
          deleted.style.cssText='font-size:12px;line-height:1.5;color:rgba(120,120,120,.78);font-weight:400;text-align:center;white-space:nowrap;padding:6px 10px;';
          body.appendChild(deleted);
          row.dataset.messageStateKey=this._messageStateKey(scene);
          if(chatIsDeleted)row.querySelectorAll('.sp-chat-message-visual').forEach(el=>{el.hidden=true;el.style.setProperty('display','none','important');});
          this._scheduleMessageState(scene,presentation);
        }
        if(chatIsDeleted){
          body.querySelectorAll('.sp-chat-message-visual').forEach(el=>el.remove());
          if(bubbleLine?.isConnected===false)bubbleLine.remove();
          row.append(body);
        }else{
          row.append(icon, body);
        }
        const dateSeparator=this._chatDateSeparator(scene,presentation);
        if(dateSeparator){const sep=document.createElement('div');sep.className='sp-chat-date-separator';const label=document.createElement('span');label.textContent=dateSeparator;sep.appendChild(label);article.appendChild(sep);}
        article.appendChild(row);
      } else {
        if (typeof scene.text === 'string' && scene.text.length) {
          const text = document.createElement('div');
          text.className = 'sp-text';
          this._renderRichText(text, scene);
          this._applyTextStyle(text, presentation.text || {}, false);
          if(String(presentation.frame?.type||'').startsWith('handdrawn-')){
            const frame=document.createElement('div');
            frame.className='sp-handdrawn-frame';frame.dataset.frameType=presentation.frame.type;
            frame.dataset.writingMode=presentation.text?.writingMode==='vertical-rl'?'vertical-rl':'horizontal-tb';
            const align=['left','right'].includes(presentation.text?.align)?presentation.text.align:'center';
            frame.dataset.frameAlign=align;
            const inkColor=String(presentation.text?.color||'').trim().toLowerCase();
            if(!inkColor||inkColor==='white'||inkColor==='#fff'||inkColor==='#ffffff')text.style.color='#171512';
            frame.appendChild(text);
            article.appendChild(frame);
            article.dataset.frame=presentation.frame.type;
            this._mountHanddrawnFrame(frame,scene,presentation);
          }else article.appendChild(text);
        }

        if (typeof scene.subText === 'string' && scene.subText.length) {
          const sub = document.createElement('div');
          sub.className = 'sp-subtext';
          sub.textContent = scene.subText;
          this._applyTextStyle(sub, presentation.subText || {}, true);
          article.appendChild(sub);
        }
      }

      this._appendSceneImage(article, scene, presentation);

      if (scene.type === 'sound' && !scene.text && !scene.subText) {
        const mark = document.createElement('span');
        mark.className = 'sp-sound-mark';
        mark.setAttribute('aria-label', 'Sound scene');
        mark.textContent = '♪';
        article.appendChild(mark);
      }

      return article;
    }

    _resolveAutoFit(scene, textStyle = {}) {
      // Explicit pixel/token sizes are an author override. Auto Fit only owns the default size.
      if (textStyle && textStyle.size && textStyle.size !== 'auto') return 'manual';
      const text = String(scene?.text || '');
      const chars = Array.from(text).length;
      const lines = text ? text.split('\n').length : 0;
      const verticalFrame=textStyle?.writingMode==='vertical-rl' && String(scene?.presentation?.frame?.type||'').startsWith('handdrawn-');
      if(verticalFrame){
        if(chars>=74 || lines>=8)return 'tight';
        if(chars>=44 || lines>=6)return 'compact';
        if(chars>=30 || lines>=4)return 'medium';
        if(chars>=22 || lines>=3)return 'soft';
      }
      // Preserve v0.1's useful behavior: multi-line/list blocks shrink before they overflow.
      if (lines >= 8 || chars >= 190) return 'tight';
      if (lines >= 6 || chars >= 145) return 'compact';
      if (lines >= 4 || chars >= 105) return 'medium';
      // A smaller viewport-safe tier for dense 3-line prose.
      if (lines >= 3 && chars >= 78) return 'soft';
      return 'normal';
    }

    _resolveSceneEffect(scene, requested) {
      if (requested && requested !== 'auto') return requested;

      // "Auto" is the product default, not an effect lottery.
      // Type, punctuation and text length must never change glyph geometry
      // during the default entrance. True Jump Landing owns the movement;
      // Auto only adds a quiet opacity reveal.
      return 'fadeRise';
    }

    _applyTextStyle(node, style, isSubText) {
      if (!style || typeof style !== 'object') style = {};
      if (style.color) node.style.color = String(style.color);
      if (Number.isFinite(Number(style.fontWeight))) node.style.fontWeight = String(Math.max(100, Math.min(900, Math.round(Number(style.fontWeight) / 100) * 100)));
      const shadows={
        none:'none',
        soft:'0 1px 4px rgba(0,0,0,.48)',
        strong:'0 2px 4px rgba(0,0,0,.86), 0 0 12px rgba(0,0,0,.48)'
      };
      if (style.shadow && shadows[style.shadow]) node.style.textShadow=shadows[style.shadow];

      const family = style.fontFamily || this.document?.appearance?.typography?.fontFamily || 'serif';
      const families = {
        serif: 'var(--sp-font-serif)',
        sans: 'var(--sp-font-sans)',
        mono: 'var(--sp-font-mono)'
      };
      node.style.fontFamily = families[family] || families.serif;

      const size = style.size;
      const tokenSizes = isSubText
        ? { small: '11px', normal: '14px', large: '17px', xl: '20px' }
        : { small: 'clamp(17px,3.8vw,24px)', normal: 'clamp(21px,4.8vw,34px)', large: 'clamp(26px,5.8vw,42px)', xl: 'clamp(32px,7vw,54px)' };
      if (typeof size === 'number' && Number.isFinite(size) && size > 0) node.style.fontSize = `${size}px`;
      else if (typeof size === 'string' && size !== 'auto' && tokenSizes[size]) node.style.fontSize = tokenSizes[size];

      if (style.wrap === 'nowrap') {
        node.style.whiteSpace = 'nowrap';
        node.style.overflowWrap = 'normal';
      }
      if (Number.isFinite(Number(style.lineHeight))) node.style.lineHeight = String(Math.max(1, Math.min(3, Number(style.lineHeight))));
      if (Number.isFinite(Number(style.letterSpacing))) node.style.letterSpacing = `${Math.max(-0.2, Math.min(0.5, Number(style.letterSpacing)))}em`;
      if (Number.isFinite(Number(style.opacity))) node.style.opacity = String(Math.max(0.1, Math.min(1, Number(style.opacity))));
      if (style.writingMode === 'vertical-rl') {
        const lines=String(node.textContent||'').split('\n');
        const longest=Math.max(1,...lines.map(line=>Array.from(line).length));
        node.dataset.writingMode='vertical-rl';
        node.style.writingMode='vertical-rl';
        node.style.textOrientation='mixed';
        node.style.height=`min(52dvh, ${Math.max(4,Math.min(22,longest+1))*1.15}em)`;
        node.style.textAlign='start';
        const blockAlign=style.align==='left'||style.align==='right'?style.align:'center';
        node.dataset.verticalBlockAlign=blockAlign;
        node.style.marginLeft=blockAlign==='left'?'0':'auto';
        node.style.marginRight=blockAlign==='right'?'0':'auto';
      } else {
        delete node.dataset.writingMode;
        node.style.writingMode='';
        node.style.textOrientation='';
        node.style.height='';
        delete node.dataset.verticalBlockAlign;
        node.style.marginLeft='';
        node.style.marginRight='';
      }
      if (style.writingMode !== 'vertical-rl' && Number.isFinite(Number(style.sideMargin)) && Number(style.sideMargin) > 0) {
        const margin=Math.max(0,Math.min(40,Number(style.sideMargin)));
        node.style.width=`calc(100% - ${margin*2}%)`;
        node.style.maxWidth=`calc(100% - ${margin*2}%)`;
        node.style.marginLeft='auto';
        node.style.marginRight='auto';
      }
      if (style.writingMode !== 'vertical-rl' && (style.align === 'left' || style.align === 'center' || style.align === 'right')) node.style.textAlign = style.align;
    }

    _applyCorePresentation(scene) {
      const view = scene.presentation?.view || 'world';
      this.host.dataset.view = view;
    }

    _finishVisibleEntranceEffects() {
      if (!this.els?.scenes) return;
      this.els.scenes.querySelectorAll('.sp-scene.sp-fx-play').forEach((node) => {
        node.classList.remove('sp-fx-play');
        const text = node.querySelector('.sp-text');
        if (text) {
          // Freeze immediately into the static post-effect appearance.
          text.style.animation = 'none';
          void text.offsetWidth;
          text.style.animation = '';
        }
      });
    }

    _playEntranceEffectOnce(article) {
      if (!article || article.dataset.fxPlayed === 'true') return;
      article.dataset.fxPlayed = 'true';
      article.classList.remove('sp-fx-play');
      void article.offsetWidth;
      article.classList.add('sp-fx-play');

      // Longest standard effect is fade/slow at ~1.25s.
      // Remove the trigger class afterwards so later layout changes cannot
      // restart the animation. Static effect character (whisper/tilt/loud)
      // is carried by data-effect rules and remains without animation.
      const timing=article.dataset?.sceneId ? (this.currentScene?.presentation?.effectTiming || {}) : {};
      const customDuration=Math.max(0,asNumber(timing.duration,0))*1000;
      const customDelay=Math.max(0,asNumber(timing.delay,0))*1000;
      const cleanupAfter=Math.max(1380,customDelay+customDuration+140);
      this._presentationTimeout(() => {
        if (article.isConnected) article.classList.remove('sp-fx-play');
      }, cleanupAfter);
    }

    _activatePresentation(scene, article) {
      const presentation = scene.presentation || {};
      const textNode = article.querySelector('.sp-text');
      const typing = presentation.typing;

      // Entrance effects belong to the moment the Scene first appears.
      // Never replay merely because the Scene remains in the visible stack
      // or because another Scene is revealed above/below it.
      this._playEntranceEffectOnce(article);

      if (textNode && typing?.enabled && !scene.richText?.ranges?.length && !scene.content?.length && typeof scene.text === 'string' && scene.text.length) {
        this._startTyping(scene, textNode, typing);
      }

      const disappear = presentation.disappear;
      const after = asNumber(disappear?.after, 0);
      if (after > 0) {
        const fade = Math.max(100, asNumber(disappear?.fade, 700));
        const motion = ['up','shatter','explode'].includes(disappear?.motion) ? disappear.motion : 'stay';
        const scope=disappear?.scope==='visible'?'visible':'scene';
        const targets=scope==='visible'
          ? [...this.els.scenes.querySelectorAll('.sp-scene')].filter(node=>node.isConnected&&!node.classList.contains('is-disappeared'))
          : [article];
        targets.forEach(target=>{
        target.style.setProperty('--sp-disappear-fade', `${fade}ms`);
        // Shatter / explode animate the Scene at its CURRENT laid-out position.
        // Their keyframes add relative motion on top of this anchor instead of
        // replacing the stack translate and jumping to the stage origin first.
        if (motion === 'shatter' || motion === 'explode') {
          target.style.setProperty('--sp-disappear-anchor-transform', target.style.transform || 'translate3d(0,0,0)');
        } else {
          target.style.removeProperty('--sp-disappear-anchor-transform');
        }
        target.classList.toggle('is-disappear-up', motion === 'up');
        target.classList.toggle('is-disappear-shatter', motion === 'shatter');
        target.classList.toggle('is-disappear-explode', motion === 'explode');
        target.classList.toggle('is-disappear-stay', motion === 'stay');
        });
        this._presentationTimeout(() => {
          if (!article.isConnected) return;
          targets.forEach(target=>{if(target.isConnected)target.classList.add('is-disappearing');});
          emit(this.host, 'sceneplayer:disappear', { index: this.index, scene, phase: 'start', motion, scope });
          this._presentationTimeout(() => {
            if (!article.isConnected) return;
            targets.forEach(target=>{if(target.isConnected)target.classList.add('is-disappeared');});
            emit(this.host, 'sceneplayer:disappear', { index: this.index, scene, phase: 'end', motion, scope });
          }, fade);
        }, after);
      }
    }

    _startTyping(scene, node, typing) {
      this._stopTyping(true);
      const chars = Array.from(scene.text || '');
      const speed = Math.max(10, asNumber(typing.speed, 55));
      const cursor = typing.cursor === false ? '' : '▍';
      let position = 0;

      node.classList.add('is-typing');
      node.textContent = cursor;
      emit(this.host, 'sceneplayer:typingstart', { index: this.index, scene });

      const timer = setInterval(() => {
        position += 1;
        node.textContent = chars.slice(0, position).join('') + (position < chars.length ? cursor : '');
        if (position >= chars.length) {
          clearInterval(timer);
          if (this.typingState?.timer === timer) this.typingState = null;
          node.classList.remove('is-typing');
          emit(this.host, 'sceneplayer:typingend', { index: this.index, scene, skipped: false });
          this._scheduleAuto();
        }
      }, speed);

      this.typingState = { timer, node, text: scene.text, sceneId: scene.id };
    }

    destroy(options = {}) {
      if (this.destroyed) return;
      const preserveHost = options?.preserveHost === true;
      this.stopAuto();
      this._resetPresentationRuntime();
      this._resetBackgroundRuntime();
      this._stopAllAudio(true);
      if (this.endingAudio) {
        try { this.endingAudio.pause(); } catch (_) {}
        try { this.endingAudio.removeAttribute('src'); this.endingAudio.load(); } catch (_) {}
      }
      this._stopBufferedPersistent('bgm', 0);
      this._stopBufferedPersistent('ambient', 0);
      Array.from(this._bufferOneShots || []).forEach((rec) => { try { rec.source.stop(); } catch (_) {} });
      if (this._bufferOneShots) this._bufferOneShots.clear();
      this._disposeIOSMediaBank();
      if (this.audioContext && typeof this.audioContext.close === 'function') {
        try { this.audioContext.close(); } catch (_) {}
      }
      (this.oneshotPool || []).forEach((audio) => this._disposeAudioElement(audio));
      this.oneshotPool = [];
      this._bufferAudioCache?.clear();
      this._bufferAudioPromises?.clear();
      this.audioGainNodes.clear();
      this.audioSourceNodes.clear();
      this._bound.forEach(([el, event, fn, listenerOptions]) => el.removeEventListener(event, fn, listenerOptions));
      this._bound.length = 0;
      // Public Player can cross-fade an old Core instance while a fresh Core
      // instance is already mounted into the same host. In that case the old
      // instance must release its own listeners/audio WITHOUT clearing the
      // shared host, otherwise its delayed destroy wipes out the second read.
      if (!preserveHost) {
        this.host.innerHTML = '';
        this.host.classList.remove('sp-core');
      }
      if (this._chatIconPreloadTimer) clearTimeout(this._chatIconPreloadTimer);
      this._chatIconPreloadTimer = 0;
      this._chatIconCache?.clear();
      this._pendingChatIconImages?.clear();
      this.destroyed = true;
    }
  }

  ScenePlayerCore.VERSION = '1.4.8-ios-ending-pre-finish';
  ScenePlayerCore.FORMAT_VERSION = '1.0';
  ScenePlayerCore.validate = assertSceneDocument;

  global.ScenePlayerCore = ScenePlayerCore;
})(typeof window !== 'undefined' ? window : globalThis);
